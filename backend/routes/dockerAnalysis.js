const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/', (req, res) => {
    const { image, scanner, username, password } = req.body;

    if (!image) return res.status(400).json({ error: "Imagem obrigatória." });

    let command = '';
    if (scanner === 'trivy') {
        command = `trivy image --format json --severity CRITICAL,HIGH,MEDIUM ${image}`;
    } else {
        command = (username && password) 
            ? `docker login -u "${username}" -p "${password}" && docker-scout cves ${image} --format json`
            : `docker-scout cves ${image} --format json`;
    }

    exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
        if (error && !stdout) {
            return res.status(500).json({ error: `Erro no scanner ${scanner}`, details: stderr });
        }

        try {
            const jsonString = stdout.substring(stdout.indexOf('{'));
            const scanData = JSON.parse(jsonString);
            
            let report = {
                image,
                scanner_used: scanner === 'trivy' ? 'Trivy' : 'Docker Scout',
                critical: 0, high: 0, medium: 0
            };

            if (scanner === 'trivy') {
                scanData.Results?.forEach(res => {
                    res.Vulnerabilities?.forEach(v => {
                        const s = v.Severity.toUpperCase();
                        if (s === 'CRITICAL') report.critical++;
                        else if (s === 'HIGH') report.high++;
                        else if (s === 'MEDIUM') report.medium++;
                    });
                });
            } else {
                report.critical = scanData.summary?.critical || 0;
                report.high = scanData.summary?.high || 0;
                report.medium = scanData.summary?.medium || 0;
            }

            res.json(report);
        } catch (e) {
            res.status(500).json({ error: "Erro ao processar dados", details: e.message });
        }
    });
});

module.exports = router;