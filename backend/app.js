const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Importando os módulos de rotas
const headerRoutes = require('./routes/headers');
const serverRoutes = require('./routes/server');
const cookieRoutes = require('./routes/cookies');
const dockerAnalysis = require('./routes/dockerAnalysis');
const wafScan = require('./routes/wafScan');
const sastScan = require('./routes/sastScan'); // Import da nova rota SAST

// --- Middlewares Globais ---

app.use(cors()); 
app.use(express.json()); // Permite ler o JSON do Axios/Postman

// Middleware de Validação para URLs (Headers, Cookies, WAF)
const validateUrl = (req, res, next) => {
    // O ?. evita o erro "Cannot read properties of undefined"
    const url = req.body?.url || req.query?.url;

    if (url && typeof url === 'string' && url.startsWith('https://')) {
        return next();
    }

    res.status(400).json({
        error: "Apenas URLs HTTPS são permitidas e o campo 'url' é obrigatório."
    });
};

// Middleware de Validação para Docker (Imagem e Tipo de Scanner)
const validateDockerParams = (req, res, next) => {
    const { image, scanner } = req.body;
    
    if (!image || image.trim().length === 0) {
        return res.status(400).json({ error: "O nome da imagem Docker é obrigatório." });
    }
    
    // Valida se o scanner enviado é um dos permitidos
    const validScanners = ['trivy', 'docker-scout'];
    if (scanner && !validScanners.includes(scanner)) {
        return res.status(400).json({ error: "Scanner inválido. Use 'trivy' ou 'docker-scout'." });
    }

    next();
};

// --- Aplicação das Rotas ---

// Ferramentas de URL
app.use('/check/headers', validateUrl, headerRoutes);
app.use('/check/server', validateUrl, serverRoutes);
app.use('/check/cookies', validateUrl, cookieRoutes);
app.use('/waf/scan', validateUrl, wafScan);

// Ferramentas de Infra e Código
app.use('/container/scan', validateDockerParams, dockerAnalysis); // Docker com Trivy/Scout
app.use('/sast/scan', sastScan); // SAST com Horusec (recebe FormData/ZIP)

// Rota de teste
app.get('/', (req, res) => {
    res.send('CyberSecurity Portal API - Uniceumar 2026');
});

app.listen(PORT, () => {
    console.log(`[SERVER] API rodando em http://localhost:${PORT}`);
    console.log(`[INFO] Middlewares de validação ativos.`);
});