const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const router = express.Router();

// Configuração do Multer
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado." });
    }

    const zipPath = req.file.path;
    const extractPath = path.join(__dirname, '..', 'temp_extract', req.file.filename);
    const jsonOutput = path.join(__dirname, '..', `result-${req.file.filename}.json`);

    try {
        // 1. Extrair o arquivo ZIP
        const zip = new AdmZip(zipPath);
        if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath, { recursive: true });
        zip.extractAllTo(extractPath, true);

        // 2. Comando Horusec:
        // -p: pasta a ser analisada
        // -o: formato de saída (json)
        // -O: caminho do arquivo de saída
        // --log-level=error: para não sujar o stdout
        const command = `horusec start -p="${extractPath}" -o="json" -O="${jsonOutput}" --log-level=error`;

        exec(command, { maxBuffer: 1024 * 10000 }, (error) => {
            // O Horusec pode retornar erro de execução se encontrar vulnerabilidades, 
            // por isso focamos em verificar se o arquivo de saída foi gerado.
            
            if (!fs.existsSync(jsonOutput)) {
                return res.status(500).json({ error: "O Horusec não gerou o relatório." });
            }

            try {
                const fileContent = fs.readFileSync(jsonOutput, 'utf8');
                const data = JSON.parse(fileContent);
                
                // 3. Mapear o formato do Horusec para o seu Frontend
                // O Horusec estrutura os dados em data.analysisVulnerabilities
                const vulnerabilities = data.analysisVulnerabilities || [];
                
                const report = {
                    total_issues: vulnerabilities.length,
                    issues: vulnerabilities.map(vuln => ({
                        title: vuln.vulnerabilities.rule_id || "Vulnerabilidade Detectada",
                        description: vuln.vulnerabilities.details,
                        file: vuln.vulnerabilities.file.replace(extractPath, ''), // Limpa o path interno
                        line: vuln.vulnerabilities.line,
                        severity: vuln.vulnerabilities.severity.toLowerCase() // 'high', 'medium', etc.
                    }))
                };

                // Limpeza total
                fs.unlinkSync(zipPath);
                fs.rmSync(extractPath, { recursive: true, force: true });
                fs.unlinkSync(jsonOutput);

                res.json(report);

            } catch (parseError) {
                res.status(500).json({ error: "Erro ao ler o relatório do Horusec." });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Falha técnica na análise do arquivo." });
    }
});

module.exports = router;