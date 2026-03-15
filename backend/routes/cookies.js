const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    try {
        const response = await axios.get(url, { timeout: 5000 });
        const cookies = response.headers['set-cookie'] || [];

        // Mapeia cada cookie encontrado e verifica as flags de segurança
        const analysis = cookies.map(cookie => {
            const cookieLower = cookie.toLowerCase();
            return {
                name: cookie.split('=')[0],
                secure: cookieLower.includes('secure'),     // Garante envio apenas via HTTPS
                httpOnly: cookieLower.includes('httponly'), // Impede roubo via JavaScript (XSS)
                sameSite: cookieLower.includes('samesite')  // Protege contra ataques CSRF
            };
        });

        res.json({
            category: "Cookie Security Audit",
            total_found: cookies.length,
            cookies: analysis,
            verdict: analysis.every(c => c.secure && c.httpOnly) 
                ? "Cookies seguem boas práticas." 
                : "Atenção: Existem cookies sem flags de segurança ativas."
        });
    } catch (err) {
        res.status(500).json({ error: "Erro ao analisar cookies", details: err.message });
    }
});

module.exports = router;