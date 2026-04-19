const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });

    const zipPath = req.file.path;
    const extractPath = path.resolve(__dirname, '..', 'temp_extract', req.file.filename);
    const jsonOutput = path.resolve(__dirname, '..', `result-${req.file.filename}.json`);

    try {
        const zip = new AdmZip(zipPath);
        if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });
        zip.extractAllTo(extractPath, true);

        // Execução nativa do Horusec dentro do container
        const command = `horusec start -p="${extractPath}" -o="json" -O="${jsonOutput}" --log-level=error --disable-docker`;

        exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
            if (!fs.existsSync(jsonOutput)) {
                return res.status(500).json({ error: "O Horusec não gerou o relatório." });
            }

            try {
                const fileContent = fs.readFileSync(jsonOutput, 'utf8');
                const data = JSON.parse(fileContent);
                const vulnerabilities = data.analysisVulnerabilities || data.vulnerabilities || [];
                
                const report = {
                    total_issues: vulnerabilities.length,
                    issues: vulnerabilities.map(vuln => {
                        const v = vuln.vulnerabilities || {};
                        
                        return {
                            title: v.rule_id || "Vulnerabilidade Detectada",
                            description: v.details || "Sem descrição técnica.",
                            file: v.file?.replace(extractPath, '') || "Desconhecido",
                            line: v.line || "0",
                            severity: (v.severity || "LOW").toLowerCase()
                            // Removido o cve_link, pois o React tratará os links na descrição
                        };
                    })
                };

                // Limpeza assíncrona
                setTimeout(() => {
                    if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
                    if (fs.existsSync(jsonOutput)) fs.unlinkSync(jsonOutput);
                    if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
                }, 2000);

                res.json(report);
            } catch (err) {
                res.status(500).json({ error: "Erro ao processar JSON." });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Erro na extração do ZIP." });
    }
});

module.exports = router;