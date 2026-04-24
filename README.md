# CyberSecurity Portal 🛡️

Este é um projeto de auditoria de segurança automatizada desenvolvido como Trabalho de Conclusão de Curso (TCC) para a **UniCesumar 2026**. O portal unifica diversas ferramentas de análise de segurança em uma única interface web.

## 🚀 Tecnologias e Ferramentas

O portal integra as seguintes ferramentas líderes de mercado:

* **SAST (Análise Estática):** [Horusec](https://horusec.io/)
* **Container Scan:** [Trivy](https://trivy.dev/) e [Docker Scout](https://docs.docker.com/scout/)
* **Análise de WAF:** [WafW00f](https://github.com/EnableSecurity/wafw00f)

## 📁 Estrutura do Projeto

```text
.
├── backend/            # API Node.js, Scanners e Dockerfile do Back
├── frontend/           # Interface React/Vite e Dockerfile do Front
├── docker-compose.yml  # Orquestração dos containers
└── README.md           # Documentação
🛠️ Pré-requisitos
Para rodar este projeto, você precisará apenas de:

Docker instalado.

Docker Compose instalado.

🏃 Como Subir o Projeto
O projeto foi totalmente conteinerizado para facilitar a execução. Siga os passos abaixo:

1. Clonar o Repositório
git clone https://github.com/tcc-joseleandro/check-security-web.git 
cd check-security-web

2. Executar o Docker Compose
Na raiz do projeto (onde está o arquivo docker-compose.yaml), execute:

Bash
docker compose up --build
Este comando irá baixar as imagens base, instalar as ferramentas de segurança (Trivy, Horusec, etc.) e subir os serviços.

3. Acessar o Portal
Após a finalização do build, o portal estará disponível em:

Frontend: http://localhost

Backend - API: http://localhost:3000

🛡️ Funcionalidades Disponíveis
- Segurança de URL: Verificação de Headers de segurança e Cookies em sites HTTPS.

- Análise Estática (SAST): Upload de arquivos ZIP para detecção de vulnerabilidades no código fonte via Horusec.

- Scanner de Containers: Análise de vulnerabilidades (CVEs) em imagens do Docker Hub via Trivy ou Docker Scout.

- Detecção de WAF: Identificação de Firewalls de Aplicação Web.
