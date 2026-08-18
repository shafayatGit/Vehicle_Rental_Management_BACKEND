import type { Knex } from "knex";
import bcrypt from "bcryptjs";

const passwordHash = bcrypt.hashSync("password123", 10);

export async function seed(knex: Knex): Promise<void> {
  await knex("staff").del();

  await knex("staff").insert([
    {
      name: "Admin Staff",
      email: "staff@example.com",
      password_hash: passwordHash,
    },
    {
      name: "Rental Manager",
      email: "manager@example.com",
      password_hash: passwordHash,
    },
  ]);
}
