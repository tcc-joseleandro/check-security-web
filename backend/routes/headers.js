const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const h = response.headers;
        
        const data = {
            hsts: !!h['strict-transport-security'],
            csp: !!h['content-security-policy'],
            xFrame: !!h['x-frame-options']
        };

        res.json({
            category: "Security Headers",
            data: data,
            // Útil para o CSV: gera uma string de recomendações baseada no que falta
            missing: Object.keys(data).filter(key => !data[key]).join(', ') || "Nenhum"
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;