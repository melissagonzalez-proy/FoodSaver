import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/User.js";

// Cargar las variables de entorno
dotenv.config();

const createAdmins = async () => {
  try {
    // 1. Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Conectado a MongoDB para la inyección de datos...");

    // 2. Preparar la contraseña encriptada por defecto
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Admin123!", salt);

    // 3. Definir los 4 perfiles (puedes cambiar los correos y nombres de tus compañeros)
    const adminsToCreate = [
      {
        nombres: "Alan",
        apellidos: "Admin",
        email: "alan@foodsaver.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        nombres: "Melissa",
        apellidos: "Admin",
        email: "melissa@foodsaver.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        nombres: "Ulisses",
        apellidos: "Admin",
        email: "ulisses@foodsaver.com",
        password: hashedPassword,
        role: "admin",
      },
      {
        nombres: "Profesora",
        apellidos: "Admin",
        email: "profe@foodsaver.com",
        password: hashedPassword,
        role: "admin",
      },
    ];

    // 4. Insertarlos en la base de datos evitando duplicados
    for (const admin of adminsToCreate) {
      const exists = await User.findOne({ email: admin.email });

      if (!exists) {
        await User.create(admin);
        console.log(`✅ Admin creado exitosamente: ${admin.email}`);
      } else {
        console.log(`⚠️  El admin ${admin.email} ya existe. Omitiendo...`);
      }
    }

    // 5. Cerrar la conexión
    mongoose.connection.close();
    console.log("🏁 Proceso de inyección finalizado.");
  } catch (error) {
    console.error("❌ Error al crear los administradores:", error);
    process.exit(1);
  }
};

// Ejecutar la función
createAdmins();
