const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "A URL é obrigatória." });
    }const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "A URL é obrigatória para o scan de WAF." });
    }

    console.log(`[WAF] Iniciando varredura em: ${url}`);

    exec(`wafw00f ${url}`, (error, stdout, stderr) => {
        
        let report = {
            url: url,
            detected: false,
            waf_name: "Nenhum detectado",
            manufacturer: "Desconhecido",
            raw_output: stdout,
            status: "success",
            scan_date: new Date().toISOString()
        };

        if (error && !stdout) {
            return res.status(500).json({ 
                error: "Erro ao executar o scanner de WAF.", 
                details: stderr || error.message 
            });
        }


        if (stdout.includes("is behind")) {
            report.detected = true;
            
            const match = stdout.match(/is behind (.+)/);
            if (match && match[1]) {
                report.waf_name = match[1].trim();
                
                if (report.waf_name.toLowerCase().includes("cloudflare")) report.manufacturer = "Cloudflare, Inc.";
                else if (report.waf_name.toLowerCase().includes("akamai")) report.manufacturer = "Akamai Technologies";
                else if (report.waf_name.toLowerCase().includes("aws")) report.manufacturer = "Amazon Web Services";
            }
        } else if (stdout.includes("No WAF detected")) {
            report.detected = false;
            report.waf_name = "Nenhum WAF detectado";
        }

        res.json(report);
    });
});

module.exports = router;

    const reportPath = path.join(__dirname, '..', 'waf-report.json');
    
    const command = `wafw00f ${url} -f json -o "${reportPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (!fs.existsSync(reportPath)) {
            console.error("Erro Wafw00f:", stderr);
            return res.status(500).json({ 
                error: "Falha ao gerar relatório de WAF", 
                details: "O arquivo de relatório não foi gerado pelo sistema." 
            });
        }

        try {
            const fileContent = fs.readFileSync(reportPath, 'utf8');
            const rawData = JSON.parse(fileContent);
            
            const result = rawData[0];

            fs.unlinkSync(reportPath);

            res.json({
                url: result.url,
                firewall: result.firewall
            });

        } catch (parseError) {
            res.status(500).json({ 
                error: "Erro ao processar o arquivo JSON do WAF", 
                details: parseError.message 
            });
        }
    });
});

module.exports = router;