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

    // Executa o wafw00f. O comando retorna o resultado no stdout.
    exec(`wafw00f ${url}`, (error, stdout, stderr) => {
        // O WafW00f nem sempre retorna erro no código de saída mesmo se falhar, 
        // então analisamos o stdout.
        
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

        // Lógica de Parse para identificar o WAF no texto de saída
        // O WafW00f geralmente imprime "is behind [WAF Name]"
        if (stdout.includes("is behind")) {
            report.detected = true;
            
            // Extrai o nome do WAF (Regex simples para pegar o que vem depois de 'behind')
            const match = stdout.match(/is behind (.+)/);
            if (match && match[1]) {
                report.waf_name = match[1].trim();
                
                // Atribuição de fabricante para enriquecer o relatório (opcional)
                if (report.waf_name.toLowerCase().includes("cloudflare")) report.manufacturer = "Cloudflare, Inc.";
                else if (report.waf_name.toLowerCase().includes("akamai")) report.manufacturer = "Akamai Technologies";
                else if (report.waf_name.toLowerCase().includes("aws")) report.manufacturer = "Amazon Web Services";
            }
        } else if (stdout.includes("No WAF detected")) {
            report.detected = false;
            report.waf_name = "Nenhum WAF detectado";
        }

        // Retorna o relatório pronto para o Frontend e Exportação (CSV/JSON)
        res.json(report);
    });
});

module.exports = router;

    // Define o nome do arquivo temporário para o relatório
    const reportPath = path.join(__dirname, '..', 'waf-report.json');
    
    // Comando: wafw00f <url> -f json -o <caminho_do_arquivo>
    const command = `wafw00f ${url} -f json -o "${reportPath}"`;

    exec(command, (error, stdout, stderr) => {
        // Verificamos se o arquivo foi criado, independente de erro no exec
        // (wafw00f às vezes retorna código de erro mesmo quando funciona)
        if (!fs.existsSync(reportPath)) {
            console.error("Erro Wafw00f:", stderr);
            return res.status(500).json({ 
                error: "Falha ao gerar relatório de WAF", 
                details: "O arquivo de relatório não foi gerado pelo sistema." 
            });
        }

        try {
            // Lendo o arquivo gerado
            const fileContent = fs.readFileSync(reportPath, 'utf8');
            const rawData = JSON.parse(fileContent);
            
            // O arquivo contém um array: [ { url, firewall, ... } ]
            const result = rawData[0];

            // Deletamos o arquivo temporário após o uso para manter o servidor limpo
            fs.unlinkSync(reportPath);

            // Retornamos exatamente o que você pediu para o frontend
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