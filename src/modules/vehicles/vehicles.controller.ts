import { NextFunction, Request, Response } from "express";
import status from "http-status";
import vehicleService from "./vehicles.service";

const getPhotoPath = (req: Request): string | null =>
  req.file ? req.file.path : null;

export const listVehiclesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      category?: string;
      search?: string;
    };
    const data = await vehicleService.list(query);

    res.status(status.OK).json({
      success: true,
      message: "Vehicles fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await vehicleService.getById(req.params.id as string);

    res.status(status.OK).json({
      success: true,
      message: "Vehicle fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as {
      name: string;
      plate_number: string;
      category: string;
      daily_rate: number;
    };
    const data = await vehicleService.create(body, getPhotoPath(req));

    res.status(status.CREATED).json({
      success: true,
      message: "Vehicle created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as {
      name?: string;
      plate_number?: string;
      category?: string;
      daily_rate?: number;
    };
    const photoPath = getPhotoPath(req);
    const data = await vehicleService.update(
      req.params.id as string,
      body,
      photoPath ?? undefined,
    );

    res.status(status.OK).json({
      success: true,
      message: "Vehicle updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeVehicleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await vehicleService.remove(req.params.id as string);

    res.status(status.OK).json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
