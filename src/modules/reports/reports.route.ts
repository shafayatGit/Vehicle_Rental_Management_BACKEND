import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import validateRequest from "../../middleware/validate.middleware";
import { monthlyRentalsHandler } from "./reports.controller";
import { monthlyRentalsQuerySchema } from "./reports.validation";

const reportsRouter = Router();

reportsRouter.use(auth);

reportsRouter.get(
  "/rentals",
  validateRequest(monthlyRentalsQuerySchema, "query"),
  monthlyRentalsHandler,
);

export default reportsRouter;
