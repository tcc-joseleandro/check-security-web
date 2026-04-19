const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// Rota POST: /container/scan (ou conforme definido no seu index.js)
router.post('/', (req, res) => {
    const { image, scanner } = req.body;

    // Validação básica
    if (!image) {
        return res.status(400).json({ 
            error: "O nome da imagem Docker é obrigatório." 
        });
    }

    // Seleção do comando baseada na escolha do Frontend
    let command = '';
    if (scanner === 'trivy') {
        // Formato JSON, filtrando apenas vulnerabilidades de severidade relevante
        command = `trivy image --format json --severity CRITICAL,HIGH,MEDIUM ${image}`;
    } else {
        // Comando padrão do Docker Scout
        command = `docker-scout cves ${image} --format json`;
    }
    console.log(`[LOG] Executando ${scanner} para a imagem: ${image}`);
    exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
        if (error && !stdout) {
            return res.status(500).json({ 
                error: `Erro ao executar o scanner ${scanner}`, 
                details: stderr || error.message 
            });
        }

        try {
            const scanData = JSON.parse(stdout);
            let report = {
                image: image,
                scanner_used: scanner === 'trivy' ? 'Trivy' : 'Docker Scout',
                critical: 0,
                high: 0,
                medium: 0
            };

            // --- Lógica de Parse do TRIVY ---
            if (scanner === 'trivy') {
                if (scanData.Results && Array.isArray(scanData.Results)) {
                    scanData.Results.forEach(target => {
                        if (target.Vulnerabilities) {
                            target.Vulnerabilities.forEach(v => {
                                const sev = v.Severity.toUpperCase();
                                if (sev === 'CRITICAL') report.critical++;
                                else if (sev === 'HIGH') report.high++;
                                else if (sev === 'MEDIUM') report.medium++;
                            });
                        }
                    });
                }
            } 
            // --- Lógica de Parse do DOCKER SCOUT ---
            else {
                // Tenta ler do sumário (mais comum em versões recentes)
                if (scanData.summary) {
                    report.critical = scanData.summary.critical || 0;
                    report.high = scanData.summary.high || 0;
                    report.medium = scanData.summary.medium || 0;
                } 
                // Fallback para varredura manual de objetos se o sumário não existir
                else if (scanData.runs && scanData.runs[0].results) {
                    scanData.runs[0].results.forEach(res => {
                        const score = res.properties?.['security-severity'] || 0;
                        if (score >= 9.0) report.critical++;
                        else if (score >= 7.0) report.high++;
                        else if (score >= 4.0) report.medium++;
                    });
                }
            }

            // Retorna o relatório consolidado
            res.json(report);

        } catch (parseError) {
            console.error("Erro no Parse JSON:", parseError);
            res.status(500).json({ 
                error: "Falha ao processar os dados da análise", 
                details: "O scanner não retornou um JSON válido.",
                rawPrefix: stdout ? stdout.substring(0, 150) : "Nenhuma saída"
            });
        }
    });
});

module.exports = router;