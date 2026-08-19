import { Router } from "express";
import auth from "../../middleware/auth.middleware";
import uploadPhoto from "../../middleware/upload.middleware";
import validateRequest from "../../middleware/validate.middleware";
import {
  createVehicleHandler,
  getVehicleHandler,
  listVehiclesHandler,
  removeVehicleHandler,
  updateVehicleHandler,
} from "./vehicles.controller";
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
} from "./vehicles.validation";

const vehiclesRouter = Router();

vehiclesRouter.use(auth);

vehiclesRouter.get(
  "/",
  validateRequest(listVehiclesQuerySchema, "query"),
  listVehiclesHandler,
);
vehiclesRouter.get("/:id", getVehicleHandler);
vehiclesRouter.post(
  "/",
  uploadPhoto,
  validateRequest(createVehicleSchema),
  createVehicleHandler,
);
vehiclesRouter.put(
  "/:id",
  uploadPhoto,
  validateRequest(updateVehicleSchema),
  updateVehicleHandler,
);
vehiclesRouter.delete("/:id", removeVehicleHandler);

export default vehiclesRouter;
