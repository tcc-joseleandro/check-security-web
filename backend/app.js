const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Importando os módulos de rotas
const headerRoutes = require('./routes/headers');
const serverRoutes = require('./routes/server');
const cookieRoutes = require('./routes/cookies');
const dockerAnalysis = require('./routes/dockerAnalysis');
const wafScan = require('./routes/wafScan'); // Nova rota para análise de WAF

// --- Middlewares Globais ---

app.use(cors()); // Libera o acesso para o seu frontend React (Vite)
app.use(express.json()); // ESSENCIAL: Permite que o Express entenda o JSON enviado pelo Axios no POST

// Middleware de Validação Inteligente (aceita Body ou Query)
const validateUrl = (req, res, next) => {
    // Tenta pegar a URL do corpo (POST) ou da query string (GET)
    const url = req.body.url || req.query.url;

    if (url && url.startsWith('https://')) {
        return next();
    }

    res.status(400).json({
        error: "Apenas URLs HTTPS são permitidas e o campo 'url' é obrigatório."
    });
};

// Middleware de Validação para Docker (Body Params)
// Verifica se o nome da imagem foi enviado no corpo da requisição
const validateDockerImage = (req, res, next) => {
    const { image } = req.body;
    if (image && image.trim().length > 0) {
        return next();
    }
    res.status(400).json({
        error: "O nome da imagem Docker é obrigatório."
    });
};


// --- Aplicação das Rotas ---

app.use('/check/headers', validateUrl, headerRoutes);
app.use('/check/server', validateUrl, serverRoutes);
app.use('/check/cookies', validateUrl, cookieRoutes);
app.use('/container/scan', validateDockerImage, dockerAnalysis);
app.use('/waf/scan', validateUrl, wafScan); // Rota para análise de WAF

// Rota de teste
app.get('/', (req, res) => {
    res.send('Check Security API está rodando!');
});

app.listen(PORT, () => {
    console.log(`Check security rodando em http://localhost:${PORT}`);
});