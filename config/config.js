//?Note: development and production config
//Provides environment-specific database configurations (development, test, production).

//Uses environment variables .env for sensitive info

require("dotenv").config();
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    //logging: false,
  },
};

//?NOTE:🌟 Best Practices
// ✅ Never use a production database for local development.
// ✅ Keep different credentials for development and production databases.
// ✅ Use environment variables (.env) instead of hardcoding credentials.
// ✅ Disable logging in production for security and performance.
