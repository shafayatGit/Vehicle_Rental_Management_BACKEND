import app from "./app.js";
import db from "./config/database.js";
import { envVars } from "./config/env.js";

async function startServer() {
  try {
    // await db.raw("SELECT 1");

    // console.log("✅ Database connected successfully");

    app.listen(envVars.PORT, () => {
      console.log(`🚀 Server running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
