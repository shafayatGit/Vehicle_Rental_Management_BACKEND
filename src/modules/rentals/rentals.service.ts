import status from "http-status";
import type { Knex } from "knex";
import db from "../../config/database";
import AppError from "../../errors/AppError";

export type RentalStatus = "booked" | "ongoing" | "completed" | "cancelled";

interface RentalRow {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: RentalStatus;
  created_at: Date;
  updated_at: Date;
}

interface VehicleRow {
  id: number;
  daily_rate: string;
}

export interface RentalResponse {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: RentalStatus;
}

export interface CreateRentalInput {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface UpdateRentalInput {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export interface ListRentalsInput {
  page: number;
  limit: number;
  vehicle_id?: number;
  status?: RentalStatus;
  start_date?: string;
  end_date?: string;
}

export interface PaginatedRentals {
  rentals: RentalResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const toDateString = (value: Date | string): string => {
  if (typeof value === "string") {
    return value;
  }
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
};

const countDays = (startDate: string, endDate: string): number =>
  Math.round(
    (new Date(`${endDate}T00:00:00.000Z`).getTime() -
      new Date(`${startDate}T00:00:00.000Z`).getTime()) /
      86400000,
  ) + 1;

class RentalService {
  private toRentalResponse(rental: RentalRow): RentalResponse {
    return {
      id: rental.id,
      vehicle_id: rental.vehicle_id,
      customer_name: rental.customer_name,
      customer_phone: rental.customer_phone,
      start_date: toDateString(rental.start_date),
      end_date: toDateString(rental.end_date),
      total_amount: Number(rental.total_amount),
      status: rental.status,
    };
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new AppError(status.BAD_REQUEST, "Invalid rental id");
    }
    return parsed;
  }

  private buildListQuery(input: ListRentalsInput) {
    const query = db<RentalRow>("rentals");

    if (input.vehicle_id !== undefined) {
      query.where({ vehicle_id: input.vehicle_id });
    }
    if (input.status !== undefined) {
      query.where({ status: input.status });
    }
    if (input.start_date !== undefined) {
      query.where("end_date", ">=", input.start_date);
    }
    if (input.end_date !== undefined) {
      query.where("start_date", "<=", input.end_date);
    }

    return query;
  }

  private findOverlapping(
    runner: Knex,
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeId?: number,
  ) {
    const query = runner<RentalRow>("rentals")
      .where({ vehicle_id: vehicleId })
      .whereNot("status", "cancelled")
      .where("start_date", "<=", endDate)
      .where("end_date", ">=", startDate);

    if (excludeId !== undefined) {
      query.whereNot({ id: excludeId });
    }

    return query;
  }

  private async assertNoOverlap(
    runner: Knex,
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeId?: number,
  ): Promise<void> {
    const conflict = await this.findOverlapping(
      runner,
      vehicleId,
      startDate,
      endDate,
      excludeId,
    ).first();

    if (conflict) {
      throw new AppError(
        status.CONFLICT,
        "Vehicle is already rented for the selected dates",
      );
    }
  }

  async list(input: ListRentalsInput): Promise<PaginatedRentals> {
    const { page, limit } = input;

    const countResult = (await this.buildListQuery(input).count({
      total: "*",
    })) as Array<{ total: string }>;
    const total = Number(countResult[0]?.total ?? 0);

    const rentals = await this.buildListQuery(input)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      rentals: rentals.map((rental) => this.toRentalResponse(rental)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<RentalResponse> {
    const rental = await db<RentalRow>("rentals")
      .where({ id: this.parseId(id) })
      .first();

    if (!rental) {
      throw new AppError(status.NOT_FOUND, "Rental not found");
    }
    return this.toRentalResponse(rental);
  }

  async create(input: CreateRentalInput): Promise<RentalResponse> {
    const [created] = await db.transaction(async (trx) => {
      const vehicle = await trx<VehicleRow>("vehicles")
        .where({ id: input.vehicle_id })
        .whereNull("deleted_at")
        .first()
        .forUpdate();

      if (!vehicle) {
        throw new AppError(status.NOT_FOUND, "Vehicle not found");
      }

      await this.assertNoOverlap(
        trx,
        input.vehicle_id,
        input.start_date,
        input.end_date,
      );

      const days = countDays(input.start_date, input.end_date);
      const totalAmount = (Number(vehicle.daily_rate) * days).toFixed(2);

      return trx<RentalRow>("rentals")
        .insert({
          vehicle_id: input.vehicle_id,
          customer_name: input.customer_name,
          customer_phone: input.customer_phone,
          start_date: input.start_date,
          end_date: input.end_date,
          total_amount: totalAmount,
        })
        .returning("*");
    });

    if (!created) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create rental",
      );
    }
    return this.toRentalResponse(created);
  }

  async update(id: string, input: UpdateRentalInput): Promise<RentalResponse> {
    const rentalId = this.parseId(id);

    const [updated] = await db.transaction(async (trx) => {
      const existing = await trx<RentalRow>("rentals")
        .where({ id: rentalId })
        .first();

      if (!existing) {
        throw new AppError(status.NOT_FOUND, "Rental not found");
      }

      const nextVehicleId = input.vehicle_id ?? existing.vehicle_id;
      const nextStartDate =
        input.start_date ?? toDateString(existing.start_date);
      const nextEndDate = input.end_date ?? toDateString(existing.end_date);
      const nextStatus = input.status ?? existing.status;

      const updatingPeriod =
        nextVehicleId !== existing.vehicle_id ||
        nextStartDate !== toDateString(existing.start_date) ||
        nextEndDate !== toDateString(existing.end_date);

      const changes: Partial<RentalRow> = { updated_at: new Date() };

      if (input.customer_name !== undefined) {
        changes.customer_name = input.customer_name;
      }
      if (input.customer_phone !== undefined) {
        changes.customer_phone = input.customer_phone;
      }
      if (input.status !== undefined) {
        changes.status = input.status;
      }

      if (updatingPeriod) {
        changes.vehicle_id = nextVehicleId;
        changes.start_date = nextStartDate;
        changes.end_date = nextEndDate;

        if (nextStatus !== "cancelled") {
          await this.assertNoOverlap(
            trx,
            nextVehicleId,
            nextStartDate,
            nextEndDate,
            rentalId,
          );
        }

        const vehicle = await trx<VehicleRow>("vehicles")
          .where({ id: nextVehicleId })
          .whereNull("deleted_at")
          .first();

        if (!vehicle) {
          throw new AppError(status.NOT_FOUND, "Vehicle not found");
        }

        const days = countDays(nextStartDate, nextEndDate);
        changes.total_amount = (Number(vehicle.daily_rate) * days).toFixed(2);
      }

      return trx<RentalRow>("rentals")
        .where({ id: rentalId })
        .update(changes)
        .returning("*");
    });

    if (!updated) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to update rental",
      );
    }
    return this.toRentalResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const rentalId = this.parseId(id);
    const existing = await db<RentalRow>("rentals")
      .where({ id: rentalId })
      .first();

    if (!existing) {
      throw new AppError(status.NOT_FOUND, "Rental not found");
    }

    await db<RentalRow>("rentals").where({ id: rentalId }).del();
  }
}

export default new RentalService();
