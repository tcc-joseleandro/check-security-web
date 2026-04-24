const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const headerRoutes = require('./routes/headers');
const serverRoutes = require('./routes/server');
const cookieRoutes = require('./routes/cookies');
const dockerAnalysis = require('./routes/dockerAnalysis');
const wafScan = require('./routes/wafScan');
const sastScan = require('./routes/sastScan');

app.use(cors()); 

app.use(express.json()); 

/**
 * Validação para ferramentas de análise de URL (Headers, Cookies e WAF)
 * Garante que a URL seja enviada e que utilize o protocolo seguro HTTPS.
 */

const validateUrl = (req, res, next) => {
    const url = req.body?.url || req.query?.url;

    if (url && typeof url === 'string' && url.startsWith('https://')) {
        return next();
    }

    res.status(400).json({
        error: "Apenas URLs HTTPS são permitidas e o campo 'url' é obrigatório."
    });
};


const validateDockerParams = (req, res, next) => {
    const { image, scanner, username, password } = req.body;
    
    if (!image || image.trim().length === 0) {
        return res.status(400).json({ error: "O nome da imagem Docker é obrigatório." });
    }
    
    const validScanners = ['trivy', 'docker-scout'];
    if (scanner && !validScanners.includes(scanner)) {
        return res.status(400).json({ error: "Scanner inválido. Use 'trivy' ou 'docker-scout'." });
    }

    if (scanner === 'docker-scout' && (username || password)) {
        if (!username || !password) {
            return res.status(400).json({ 
                error: "Para autenticação no Scout, informe tanto o Username quanto o Personal Access Token (PAT)." 
            });
        }
    }

    next();
};


app.use('/check/headers', validateUrl, headerRoutes);
app.use('/check/server', validateUrl, serverRoutes);
app.use('/check/cookies', validateUrl, cookieRoutes);
app.use('/waf/scan', validateUrl, wafScan);

app.use('/container/scan', validateDockerParams, dockerAnalysis); 
app.use('/sast/scan', sastScan); 

app.get('/', (req, res) => {
    res.json({
        message: 'CyberSecurity Portal API - Ativa',
        version: '1.0.0',
        author: 'José Leandro de Sousa Silva',
        tcc_project: 'Unicesumar 2026'
    });
});

app.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `[SERVER] API rodando com sucesso em http://localhost:${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `[INFO] Middlewares de segurança e validação aplicados.`);
});