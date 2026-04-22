const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/', (req, res) => {
    const { image, scanner, username, password } = req.body;

    if (!image) {
        return res.status(400).json({ error: "O nome da imagem Docker é obrigatório." });
    }

    let command = '';

    if (scanner === 'trivy') {
        command = `trivy image --format json --severity CRITICAL,HIGH,MEDIUM ${image}`;
    } else {
        // Lógica para Docker Scout com Autenticação
        // Se houver credenciais, fazemos o login e depois o scan na mesma linha (&&)
        if (username && password) {
            console.log(`[LOG] Realizando login no Docker Hub para o Scout...`);
            // Usamos o --password-stdin para maior segurança via shell se preferir, 
            // mas aqui simplificamos para o comando direto
            command = `docker login -u "${username}" -p "${password}" && docker-scout cves ${image} --format json`;
        } else {
            command = `docker-scout cves ${image} --format json`;
        }
    }

    console.log(`[LOG] Executando ${scanner} para a imagem: ${image}`);

    exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
        // Nota: O stdout do docker login pode aparecer aqui. 
        // Se houver erro de login, o comando de scan nem executa devido ao &&
        if (error && !stdout) {
            return res.status(500).json({ 
                error: `Erro ao executar o scanner ${scanner}`, 
                details: stderr || error.message 
            });
        }

        try {
            // Se houver login, o stdout pode conter a frase "Login Succeeded" antes do JSON.
            // Vamos limpar o stdout para pegar apenas o JSON válido.
            const jsonStartIndex = stdout.indexOf('{');
            const jsonString = stdout.substring(jsonStartIndex);
            
            const scanData = JSON.parse(jsonString);
            
            let report = {
                image: image,
                scanner_used: scanner === 'trivy' ? 'Trivy' : 'Docker Scout',
                critical: 0,
                high: 0,
                medium: 0
            };

            if (scanner === 'trivy') {
                if (scanData.Results) {
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
            } else {
                // Parse Docker Scout
                if (scanData.summary) {
                    report.critical = scanData.summary.critical || 0;
                    report.high = scanData.summary.high || 0;
                    report.medium = scanData.summary.medium || 0;
                } else if (scanData.runs && scanData.runs[0].results) {
                    scanData.runs[0].results.forEach(res => {
                        const score = res.properties?.['security-severity'] || 0;
                        if (score >= 9.0) report.critical++;
                        else if (score >= 7.0) report.high++;
                        else if (score >= 4.0) report.medium++;
                    });
                }
            }

            res.json(report);

        } catch (parseError) {
            console.error("Erro no Parse JSON:", parseError);
            res.status(500).json({ 
                error: "Falha ao processar os dados da análise", 
                details: "Saída inválida do scanner.",
                raw: stdout ? stdout.substring(0, 200) : "Vazio"
            });
        }
    });
});

module.exports = router;