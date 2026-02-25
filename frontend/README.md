# FoodSaver

Aplicación fullstack para gestionar y guardar recetas de comida.

## 📁 Estructura del Proyecto

```
FoodSaver/
├── backend/           # API Express.js
│   └── src/
│       └── server.js  # Punto de entrada del servidor
└── frontend/          # Aplicación React + TypeScript + Vite
    └── src/
        ├── App.tsx
        ├── main.tsx
        └── assets/
```

## ⚙️ Requisitos Previos

Instalen Node:
- **Node.js** (versión 16 o superior)
- **npm** (viene con Node.js)

Verifiquen las versiones:
```bash
node --version
npm --version
```

## 🚀 Instalación

### 1. Clonar o descargar el repositorio

```bash
cd FoodSaver
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

## ▶️ Ejecutar el Proyecto

El backend y frontend se ejecutan en terminales **separadas**.

### Terminal 1: Ejecutar el Backend

```bash
cd backend
npm start
```

El servidor se iniciará en `http://localhost:3000` 

### Terminal 2: Ejecutar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación se abrirá en `http://localhost:5173` (puerto por defecto de Vite)

## 📚 Comandos Disponibles

### Backend
- `npm start` - Inicia el servidor

### Frontend
- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila el proyecto para producción
- `npm run lint` - Ejecuta el linter para revisar código
- `npm run preview` - Visualiza la compilación de producción

## 💡 Consejos

1. **Abre dos terminales**: Una para el backend y otra para el frontend
2. **Verifica los puertos**: Asegúrate de que los puertos 3000 y 5173 estén disponibles
3. **Recarga la página**: Si hay cambios en el frontend, actualiza el navegador (Ctrl+R o Cmd+R)
4. **Errores comunes**: Si npm install falla, intenta:
   ```bash
   npm cache clean --force
   npm install
   ```

## 📝 Notas

- El frontend usa **Tailwind CSS** para estilos y **Lucide** para los iconos
- Se utiliza **TypeScript** para mayor seguridad de tipos
- El backend usa **Express.js** como framework

¡Listo! Si hay dudas, revisen los `package.json` en cada carpeta o contacta o me comentan.
