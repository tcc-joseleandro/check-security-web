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

        const command = `horusec start -p="${extractPath}" -o="json" -O="${jsonOutput}" --log-level=error --disable-docker`;

        exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
            if (!fs.existsSync(jsonOutput)) {
                console.error("Horusec Error Stderr:", stderr);
                return res.status(500).json({ error: "O Horusec não gerou o relatório.", details: stderr });
            }

            try {
                const fileContent = fs.readFileSync(jsonOutput, 'utf8');
                const fullReport = JSON.parse(fileContent);

                const summary = {
                    total_vulnerabilities: fullReport.analysisVulnerabilities?.length || 0,
                    scan_status: fullReport.status,
                    created_at: fullReport.createdAt
                };

                res.json({
                    summary,
                    raw_horusec_report: fullReport 
                });

                setTimeout(() => {
                    [zipPath, jsonOutput].forEach(f => { if(fs.existsSync(f)) fs.unlinkSync(f); });
                    if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
                }, 5000);

            } catch (err) {
                res.status(500).json({ error: "Erro ao ler o report gerado pelo Horusec." });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Erro crítico no processamento do arquivo ZIP." });
    }
});

module.exports = router;