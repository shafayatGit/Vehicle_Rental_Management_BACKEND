import type { Knex } from "knex";
import "dotenv/config";

const config: Record<string, Knex.Config> = {
  development: {
    client: "pg",

    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },

    migrations: {
      directory: "./src/database/migrations",
    },

    seeds: {
      directory: "./src/database/seeds",
    },

    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
