const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL necessária" });

    try {
        // Faz a requisição uma única vez para otimizar
        const response = await axios.get(url, { timeout: 5000 });
        const h = response.headers;

        // Consolida todas as análises em um único objeto
        const report = {
            target: url,
            timestamp: new Date(),
            analysis: {
                headers: { csp: !!h['content-security-policy'], hsts: !!h['strict-transport-security'] },
                server: { name: h['server'] || "Protected" },
                cookies: (h['set-cookie'] || []).length
            }
        };
        res.json(report);
    } catch (err) { res.status(500).json({ error: "Erro no scan completo" }); }
});

module.exports = router;