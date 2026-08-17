import type { Knex } from "knex";
import "dotenv/config";
import path from "path";

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
      min: 2,
      max: 10,
    },
  },
};

export default config;
