const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        const h = response.headers;

        res.json({
            category: "Server Fingerprinting",
            url: url,
            details: {
                server_header: h['server'] || "Oculto/Não exposto",
                x_powered_by: h['x-powered-by'] || "Oculto/Não exposto"
            },
            is_exposed: !!(h['server'] || h['x-powered-by']),
            recommendation: "Ocultar banners de versão para dificultar ataques direcionados."
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao analisar info do servidor", details: err.message });
    }
});

module.exports = router;