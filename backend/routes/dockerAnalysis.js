const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();

// Alteramos de .get para .post para coincidir com o app.js e o frontend
router.post('/', (req, res) => {
    // Agora pegamos 'image' do req.body (JSON enviado pelo Axios)
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: "O nome da imagem Docker é obrigatório no corpo da requisição." });
    }

    // Comando do Scout focado em CVEs (Vulnerabilidades)
    const command = `docker-scout cves ${image} --format json`;

    // maxBuffer aumentado para suportar relatórios JSON grandes
    exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
        // Log para você ver no terminal do VS Code o que o Scout respondeu
        console.log("Saída do Scout:", stdout);

        if (error && !stdout) {
            return res.status(500).json({ 
                error: "Erro na análise da imagem", 
                details: stderr || error.message 
            });
        }

        // Verificação extra: se o stdout não começa com '{' ou '[', não é JSON
        if (!stdout.trim().startsWith('{') && !stdout.trim().startsWith('[')) {
            return res.status(500).json({ 
                error: "O Docker Scout retornou um erro de texto em vez de JSON", 
                details: stdout.trim() 
            });
        }

        try {
            const scanData = JSON.parse(stdout);
            // ... resto do seu mapeamento do report ...
            res.json(report);
        } catch (parseError) {
            res.status(500).json({ 
                error: "Erro ao processar dados do Scout", 
                details: parseError.message,
                rawOutput: stdout.substring(0, 100) // Mostra o início do erro
            });
        }
    });
});

module.exports = router;