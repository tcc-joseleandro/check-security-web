const express = require('express');
const app = express();
const PORT = 3000;

// Importando os módulos de rotas
const headerRoutes = require('./routes/headers');
const serverRoutes = require('./routes/server');
const cookieRoutes = require('./routes/cookies');
""
// Middleware de Validação Global (opcional, para não repetir em cada arquivo)
const validateUrl = (req, res, next) => {
    const { url } = req.query;
    if (url && url.startsWith('https://'))
        return next();
    res.status(400).json({
        error: "Apenas URLs HTTPS são permitidas."
    });
};

// Aplicando as rotas com seus respectivos prefixos
app.use('/check/headers', validateUrl, headerRoutes);
app.use('/check/server', validateUrl, serverRoutes);
app.use('/check/cookies', validateUrl, cookieRoutes);

app.listen(PORT, () => {
    console.log(`Check security rodando em http://localhost:${PORT}`);
});