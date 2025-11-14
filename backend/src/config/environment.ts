// backend/src/config/environment.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },

  logging: {
    mongoUri: process.env.MONGO_LOG_URI,
    level: process.env.LOG_LEVEL || "info",
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || "tu_secreto_por_defecto",
  },
};
