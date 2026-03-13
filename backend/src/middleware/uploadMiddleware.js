import multer from "multer";
import fs from "fs";
import path from "path";

// Configurar dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/documents/";
    // Si la carpeta no existe, Node.js la crea automáticamente
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Genera un nombre único: nombreDelCampo-fechaActual.extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// Filtro de seguridad: solo aceptar PDFs e imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Formato no válido. Solo se permiten archivos PDF, JPG y PNG."),
    );
  }
};

// Exportar el middleware configurado (límite de 5MB)
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});
