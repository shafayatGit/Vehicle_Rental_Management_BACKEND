import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import validateRequest from "../../middleware/validate.middleware";
import {
  createRentalHandler,
  getRentalHandler,
  listRentalsHandler,
  removeRentalHandler,
  updateRentalHandler,
} from "./rentals.controller";
import {
  createRentalSchema,
  listRentalsQuerySchema,
  updateRentalSchema,
} from "./rentals.validation";

const rentalsRouter = Router();

rentalsRouter.use(auth);

rentalsRouter.get(
  "/",
  validateRequest(listRentalsQuerySchema, "query"),
  listRentalsHandler,
);
rentalsRouter.get("/:id", getRentalHandler);
rentalsRouter.post(
  "/",
  validateRequest(createRentalSchema),
  createRentalHandler,
);
rentalsRouter.put(
  "/:id",
  validateRequest(updateRentalSchema),
  updateRentalHandler,
);
rentalsRouter.delete("/:id", removeRentalHandler);

export default rentalsRouter;
