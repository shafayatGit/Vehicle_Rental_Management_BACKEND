import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("rentals", (table) => {
    table.increments("id").primary();
    table
      .integer("vehicle_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("vehicles")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");
    table.string("customer_name").notNullable();
    table.string("customer_phone").notNullable();
    table.date("start_date").notNullable();
    table.date("end_date").notNullable();
    table.decimal("total_amount", 10, 2).notNullable();
    table
      .enu("status", ["booked", "ongoing", "completed", "cancelled"], {
        useNative: true,
        enumName: "rental_status",
      })
      .notNullable()
      .defaultTo("booked");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index(["vehicle_id", "status"]);
    table.index(["start_date", "end_date"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rentals");
  await knex.raw('DROP TYPE IF EXISTS "rental_status"');
}
