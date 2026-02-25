# FoodSaver - Backend

API REST desarrollada con **Express.js** para la gestioón de datos de la aplicación FoodSaver.

## 📁 Estructura del Proyecto

```
backend/
├── package.json       # Dependencias y scripts
├── README.md          # Este archivo
└── src/
    └── server.js      # Punto de entrada de la API
```

## ⚙️ Requisitos Previos

Instalen nodejs (npm viene con node):
- **Node.js** (versión 16 o superior)
- **npm** (viene con Node.js)

Verifiquen las versiones:
```bash
node --version
npm --version
```

## 🚀 Instalación

### 1. Navega a la carpeta del backend

```bash
cd backend
```

### 2. Instala las dependencias

```bash
npm install
```

## ▶️ Ejecutar el Backend

### Opción 1: Ejecución Normal

```bash
npm start
```

### Opción 2: Ejecución con Nodemon (requiere instalación adicional)

Si deseas que el servidor se reinicie automáticamente al hacer cambios:

```bash
npm install --save-dev nodemon
npx nodemon src/server.js
```

## 🔌 Puertos y Endpoints

El servidor se ejecuta en:
```
http://localhost:3000
```

### Endpoints Actuales
- `GET /` - Endpoint de prueba que retorna "Hello, world!"

## 📦 Dependencias

- **Express.js** (`^5.2.1`) - Framework para crear APIs HTTP

## 🛠️ Scripts Disponibles

- `npm start` - Inicia el servidor
- `npm test` - Script de pruebas (pendiente de configurar)

## 💡 Consejos

1. **Puerto 3000**: Asegúrate de que esté disponible antes de iniciar
2. **Certificar que el frontend se conecte**: El frontend debe apuntar a `http://localhost:3000`
3. **Logs en consola**: Verifica que aparezca "Running on port 3000" cuando inicie
4. **Errores de módulos**: Si hay errores al importar, ejecuta:
   ```bash
   npm cache clean --force
   npm install
   ```

## 📝 Notas

- El backend utiliza **módulos ES6** (`type: "module"` en package.json)
- Se puede extender con más rutas y controladores conforme crezca el proyecto
- Considera usar variables de entorno para configuraciones sensibles (puertos, BD, etc.)

## 👥 Autor

Desarrollado por: Melissa, Ulisses y Alan Enrique Chala Perea

---

Quedo atento a cualquier duda
