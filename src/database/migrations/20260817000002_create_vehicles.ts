import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("vehicles", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("plate_number").notNullable().unique();
    table.string("category").notNullable();
    table.decimal("daily_rate", 10, 2).notNullable();
    table.string("photo_path").nullable();
    table.timestamp("deleted_at").nullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index(["category"]);
    table.index(["deleted_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("vehicles");
}
