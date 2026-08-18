import type { Knex } from "knex";
import path from "path";
import { envVars } from "./env";

const config: { development: Knex.Config } = {
  development: {
    client: "pg",

    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },

    migrations: {
      directory: path.resolve(__dirname, "../database/migrations"),
    },

    seeds: {
      directory: path.resolve(__dirname, "../database/seeds"),
    },

    pool: {
      min: parseInt(envVars.DB_POOL_MIN),
      max: parseInt(envVars.DB_POOL_MAX),
    },
  },
};

export default config;
