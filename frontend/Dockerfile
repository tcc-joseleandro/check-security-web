FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install && npm install -g vite

COPY . .

RUN npm rebuild

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]