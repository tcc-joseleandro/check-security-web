const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        const cookies = response.headers['set-cookie'] || [];

        const analysis = cookies.map(cookie => {
            const parts = cookie.split(';').map(p => p.trim().toLowerCase());
            return {
                name: cookie.split('=')[0],
                secure: parts.includes('secure'),
                httpOnly: parts.includes('httponly'),
                sameSite: parts.find(p => p.startsWith('samesite'))?.split('=')[1] || "não definido"
            };
        });

        res.json({
            category: "Cookie Security Audit",
            total_found: cookies.length,
            cookies: analysis,
            verdict: analysis.every(c => c.secure && c.httpOnly) 
                ? "Seguro" 
                : "Vulnerável"
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao analisar cookies", details: err.message });
    }
});

module.exports = router;