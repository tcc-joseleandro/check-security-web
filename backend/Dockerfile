FROM node:20-slim

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    git \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install wafw00f --break-system-packages

# RUN wget -qO - https://aquasecurity.github.io/trivy-repo/dabest.gpg | apt-key add - \
#     && echo "deb https://aquasecurity.github.io/trivy-repo/deb buster main" | tee -a /etc/apt/sources.list.d/trivy.list \
#     && apt-get update && apt-get install -y trivy

RUN  wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | tee -a /usr/share/keyrings/trivy.gpg > /dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | tee -a /etc/apt/sources.list.d/trivy.list \
    && apt-get update && apt-get install trivy

RUN curl -L https://github.com/ZupIT/horusec/releases/latest/download/horusec_linux_amd64 -o /usr/local/bin/horusec \
    && chmod +x /usr/local/bin/horusec
    
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]