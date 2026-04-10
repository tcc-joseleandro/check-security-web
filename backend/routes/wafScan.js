const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.post('/', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "A URL é obrigatória." });
    }

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