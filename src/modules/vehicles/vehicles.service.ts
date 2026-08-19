import status from "http-status";
import { Knex } from "knex";
import db from "../../config/database";
import AppError from "../../errors/AppError";

interface VehicleRow {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: string;
  photo_path: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleResponse {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path: string | null;
}

export interface CreateVehicleInput {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
}

export interface UpdateVehicleInput {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
}

export interface ListVehiclesInput {
  page: number;
  limit: number;
  category?: string;
  search?: string;
}

export interface PaginatedVehicles {
  vehicles: VehicleResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class VehicleService {
  private toVehicleResponse(vehicle: VehicleRow): VehicleResponse {
    return {
      id: vehicle.id,
      name: vehicle.name,
      plate_number: vehicle.plate_number,
      category: vehicle.category,
      daily_rate: Number(vehicle.daily_rate),
      photo_path: vehicle.photo_path,
    };
  }

  private parseId(id: string): number {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new AppError(status.BAD_REQUEST, "Invalid vehicle id");
    }
    return parsed;
  }

  private buildListQuery(category?: string, search?: string) {
    const query = db<VehicleRow>("vehicles").whereNull("deleted_at");

    if (category) {
      query.andWhere("category", "ilike", category);
    }
    if (search) {
      query.andWhere("name", "ilike", `%${search}%`);
    }

    return query;
  }

  private async getExistingVehicle(id: number): Promise<VehicleRow> {
    const vehicle = await db<VehicleRow>("vehicles")
      .where({ id })
      .whereNull("deleted_at")
      .first();

    if (!vehicle) {
      throw new AppError(status.NOT_FOUND, "Vehicle not found");
    }
    return vehicle;
  }

  private async assertPlateNumberAvailable(
    plateNumber: string,
    excludeId?: number,
  ): Promise<void> {
    const query = db<VehicleRow>("vehicles").where({
      plate_number: plateNumber,
    });
    if (excludeId) {
      query.whereNot({ id: excludeId });
    }

    const existing = await query.first();
    if (existing) {
      throw new AppError(
        status.CONFLICT,
        `Vehicle with plate number "${plateNumber}" already exists`,
      );
    }
  }

  async list(input: ListVehiclesInput): Promise<PaginatedVehicles> {
    const { page, limit, category, search } = input;

    const countResult = (await this.buildListQuery(category, search).count({
      total: "*",
    })) as Array<{ total: string }>;
    const total = Number(countResult[0]?.total ?? 0);

    const vehicles = await this.buildListQuery(category, search)
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      vehicles: vehicles.map((vehicle) => this.toVehicleResponse(vehicle)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<VehicleResponse> {
    const vehicle = await this.getExistingVehicle(this.parseId(id));
    return this.toVehicleResponse(vehicle);
  }

  async create(
    input: CreateVehicleInput,
    photoPath: string | null = null,
  ): Promise<VehicleResponse> {
    await this.assertPlateNumberAvailable(input.plate_number);

    const [created] = await db<VehicleRow>("vehicles")
      .insert({
        ...input,
        daily_rate: String(input.daily_rate),
        photo_path: photoPath,
      })
      .returning("*");

    if (!created) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to create vehicle",
      );
    }
    return this.toVehicleResponse(created);
  }

  async update(
    id: string,
    input: UpdateVehicleInput,
    newPhotoPath?: string,
  ): Promise<VehicleResponse> {
    const vehicleId = this.parseId(id);
    const vehicle = await this.getExistingVehicle(vehicleId);

    if (input.plate_number && input.plate_number !== vehicle.plate_number) {
      await this.assertPlateNumberAvailable(input.plate_number, vehicleId);
    }

    const updates: Partial<VehicleRow> = { updated_at: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.plate_number !== undefined)
      updates.plate_number = input.plate_number;
    if (input.category !== undefined) updates.category = input.category;
    if (input.daily_rate !== undefined)
      updates.daily_rate = String(input.daily_rate);
    if (newPhotoPath) updates.photo_path = newPhotoPath;

    const [updated] = await db<VehicleRow>("vehicles")
      .where({ id: vehicleId })
      .update(updates)
      .returning("*");

    if (!updated) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        "Failed to update vehicle",
      );
    }
    return this.toVehicleResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const vehicleId = this.parseId(id);
    await this.getExistingVehicle(vehicleId);

    await db<VehicleRow>("vehicles")
      .where({ id: vehicleId })
      .update({ deleted_at: db.fn.now(), updated_at: new Date() });
  }
}

export default new VehicleService();
