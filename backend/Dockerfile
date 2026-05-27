FROM node:18-alpine

WORKDIR /app

# Copiar SOLO la carpeta backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código del backend
COPY backend/ .

# Exponer puerto
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]
