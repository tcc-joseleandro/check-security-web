const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const h = response.headers;
        res.json({
            category: "Security Headers",
            data: {
                hsts: !!h['strict-transport-security'],
                csp: !!h['content-security-policy'],
                xFrame: !!h['x-frame-options']
            }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;