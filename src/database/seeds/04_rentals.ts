import type { Knex } from "knex";

interface SeedVehicle {
  id: number;
  daily_rate: string;
}

const rental = (
  vehicle: SeedVehicle,
  customerName: string,
  customerPhone: string,
  startDate: string,
  endDate: string,
  status: "booked" | "ongoing" | "completed" | "cancelled",
) => {
  const days =
    new Date(endDate).getTime() / 86400000 -
    new Date(startDate).getTime() / 86400000 +
    1;

  return {
    vehicle_id: vehicle.id,
    customer_name: customerName,
    customer_phone: customerPhone,
    start_date: startDate,
    end_date: endDate,
    total_amount: (Number(vehicle.daily_rate) * days).toFixed(2),
    status,
  };
};

export async function seed(knex: Knex): Promise<void> {
  await knex("rentals").del();

  const vehicles = await knex("vehicles")
    .select("id", "daily_rate")
    .orderBy("id", "asc");

  const [swift, corolla, civic, hiace, x5] = vehicles;
  if (!swift || !corolla || !civic || !hiace || !x5) {
    throw new Error("Expected at least 5 seeded vehicles");
  }

  await knex("rentals").insert([
    rental(
      swift,
      "Karim Uddin",
      "+8801711111111",
      "2026-07-10",
      "2026-07-15",
      "completed",
    ),
    rental(
      corolla,
      "Rahima Begum",
      "+8801722222222",
      "2026-07-29",
      "2026-08-03",
      "completed",
    ),
    rental(
      civic,
      "Tanvir Ahmed",
      "+8801733333333",
      "2026-08-10",
      "2026-08-20",
      "ongoing",
    ),
    rental(
      hiace,
      "Nusrat Jahan",
      "+8801744444444",
      "2026-08-05",
      "2026-08-08",
      "cancelled",
    ),
    rental(
      x5,
      "Mahmudul Hasan",
      "+8801755555555",
      "2026-08-01",
      "2026-08-05",
      "completed",
    ),
    rental(
      swift,
      "Sabina Yasmin",
      "+8801766666666",
      "2026-08-20",
      "2026-08-25",
      "booked",
    ),
  ]);
}
