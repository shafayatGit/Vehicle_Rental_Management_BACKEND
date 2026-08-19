import { NextFunction, Request, Response } from "express";
import status from "http-status";
import rentalService, {
  CreateRentalInput,
  ListRentalsInput,
  UpdateRentalInput,
} from "./rentals.service";

export const listRentalsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query as unknown as ListRentalsInput;
    const data = await rentalService.list(query);

    res.status(status.OK).json({
      success: true,
      message: "Rentals fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRentalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await rentalService.getById(req.params.id as string);

    res.status(status.OK).json({
      success: true,
      message: "Rental fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createRentalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as CreateRentalInput;
    const data = await rentalService.create(body);

    res.status(status.CREATED).json({
      success: true,
      message: "Rental created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRentalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as UpdateRentalInput;
    const data = await rentalService.update(req.params.id as string, body);

    res.status(status.OK).json({
      success: true,
      message: "Rental updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const removeRentalHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await rentalService.remove(req.params.id as string);

    res.status(status.OK).json({
      success: true,
      message: "Rental deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
