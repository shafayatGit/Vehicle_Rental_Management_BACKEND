import db from "../../config/database";

export interface MonthlyReportInput {
  month: string;
  vehicle_id?: number;
}

export interface VehicleMonthlyStats {
  id: number;
  name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface TopVehicle {
  id: number;
  name: string;
  revenue: number;
}

export interface MonthlyReport {
  month: string;
  vehicles: VehicleMonthlyStats[];
  topVehicle: TopVehicle | null;
}

interface MonthlyRentalRow {
  id: number;
  name: string;
  total_bookings: number | string;
  days_rented: number | string;
  revenue: number | string;
}

const getMonthEnd = (month: string): string => {
  const [year, monthStart] = month.split("-").map(Number) as [number, number];
  const lastDay = new Date(year, monthStart, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}`;
};

class ReportService {
  async monthlyRentals(input: MonthlyReportInput): Promise<MonthlyReport> {
    const { month, vehicle_id: vehicleId } = input;
    const monthStart = `${month}-01`;
    const monthEnd = getMonthEnd(month);

    const query = db("vehicles as v")
      .join("rentals as r", "r.vehicle_id", "v.id")
      .whereNull("v.deleted_at")
      .whereNot("r.status", "cancelled")
      .where("r.start_date", "<=", monthEnd)
      .where("r.end_date", ">=", monthStart);

    if (vehicleId !== undefined) {
      query.where("v.id", vehicleId);
    }

    const rows = (await query
      .select(
        "v.id",
        "v.name",
        db.raw("COUNT(r.id)::int AS total_bookings"),
        db.raw(
          "SUM(LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1)::int AS days_rented",
          [monthEnd, monthStart],
        ),
        db.raw(
          "SUM((LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1) * v.daily_rate)::numeric AS revenue",
          [monthEnd, monthStart],
        ),
      )
      .groupBy("v.id", "v.name")
      .orderByRaw("revenue DESC, v.id ASC")) as MonthlyRentalRow[];

    const vehicles: VehicleMonthlyStats[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      total_bookings: Number(row.total_bookings),
      days_rented: Number(row.days_rented),
      revenue: Number(row.revenue),
    }));

    const topVehicle: TopVehicle | null = vehicles[0]
      ? {
          id: vehicles[0].id,
          name: vehicles[0].name,
          revenue: vehicles[0].revenue,
        }
      : null;

    return { month, vehicles, topVehicle };
  }
}

export default new ReportService();
