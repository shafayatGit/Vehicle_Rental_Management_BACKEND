import { NextFunction, Request, Response } from "express";
import status from "http-status";
import reportService from "./reports.service";
import type { MonthlyReportInput } from "./reports.service";

export const monthlyRentalsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.query as unknown as MonthlyReportInput;
    const data = await reportService.monthlyRentals(query);

    res.status(status.OK).json({
      success: true,
      message: "Monthly rental report fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
