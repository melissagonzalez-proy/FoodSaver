FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar todo el código (backend completo)
COPY . .

# Puerto que usa server.js (verifica el puerto en tu código)
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]
