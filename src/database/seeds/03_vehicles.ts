import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("vehicles").del();

  await knex("vehicles").insert([
    {
      name: "Suzuki Swift",
      plate_number: "DHA-11-2345",
      category: "Hatchback",
      daily_rate: 3000,
    },
    {
      name: "Toyota Corolla",
      plate_number: "DHA-12-3456",
      category: "Sedan",
      daily_rate: 4500,
    },
    {
      name: "Honda Civic",
      plate_number: "DHA-13-4567",
      category: "Sedan",
      daily_rate: 5000,
    },
    {
      name: "Toyota HiAce",
      plate_number: "DHA-14-5678",
      category: "Van",
      daily_rate: 8000,
    },
    {
      name: "BMW X5",
      plate_number: "DHA-15-6789",
      category: "SUV",
      daily_rate: 12000,
    },
  ]);
}
