const express = require('express');
const { exec, execSync } = require('child_process');
const path = require('path');
const router = express.Router();

// Define o caminho para o script subindo dois níveis (de /backend/routes para a raiz)
const SCRIPT_PATH = path.join(__dirname, '..', '..', 'scripts', 'setup-scout.sh');

/**
 * Função para garantir que o Docker Scout está instalado.
 * Executada uma vez quando a rota é carregada.
 */
const prepareEnvironment = () => {
    try {
        console.log(`[NODE] Verificando ambiente via: ${SCRIPT_PATH}`);
        // Executa o shell script de forma síncrona
        execSync(`bash ${SCRIPT_PATH}`, { stdio: 'inherit' });
    } catch (error) {
        console.error("[NODE] Erro ao preparar ambiente Docker Scout:", error.message);
    }
};

// Inicializa a verificação
prepareEnvironment();

router.get('/', (req, res) => {
    const { image } = req.query;

    if (!image) {
        return res.status(400).json({ error: "Parâmetro 'image' é obrigatório. Ex: ?image=node:18" });
    }

    // Comando do Scout focado em CVEs (Vulnerabilidades)
    const command = `docker scout cves ${image} --format json`;

    // maxBuffer aumentado para suportar relatórios JSON grandes de imagens pesadas
    exec(command, { maxBuffer: 1024 * 10000 }, (error, stdout, stderr) => {
        if (error && !stdout) {
            return res.status(500).json({ 
                error: "Erro na análise da imagem", 
                details: stderr || error.message 
            });
        }

        try {
            const scanData = JSON.parse(stdout);
            
            // Resumo da análise para o frontend/cliente
            const report = {
                image: image,
                total_vulnerabilities: scanData.vulnerabilities?.length || 0,
                severity_count: {
                    critical: scanData.vulnerabilities?.filter(v => v.severity === 'critical').length || 0,
                    high: scanData.vulnerabilities?.filter(v => v.severity === 'high').length || 0,
                    medium: scanData.vulnerabilities?.filter(v => v.severity === 'medium').length || 0
                },
                // Lista as 5 principais vulnerabilidades críticas com sugestão de correção
                recommendations: scanData.vulnerabilities
                    ?.filter(v => v.severity === 'critical')
                    .slice(0, 5)
                    .map(v => ({
                        id: v.id,
                        package: v.package.name,
                        current_version: v.package.version,
                        fix_version: v.fix || "No fix available"
                    }))
            };

            res.json({
                status: "completed",
                data: report,
                safe_to_deploy: report.severity_count.critical === 0
            });

        } catch (parseError) {
            res.status(500).json({ error: "Erro ao processar dados do Scout", details: parseError.message });
        }
    });
});

module.exports = router;