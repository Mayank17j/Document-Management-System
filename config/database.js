const { Sequelize } = require("sequelize");
const config = require("./config")[process.env.NODE_ENV || "development"]; //const env = process.env.NODE_ENV || "development";

// Initialize Sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port,
  logging: config.logging,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Unable to connnect to database", error);
  });

module.exports = sequelize;
