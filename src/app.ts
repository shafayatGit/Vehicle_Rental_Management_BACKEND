import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import authRouter from "./modules/auth/auth.route";
import vehiclesRouter from "./modules/vehicles/vehicles.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Vehicle Rental API is running",
  });
});

app.use("/auth", authRouter);
app.use("/vehicles", vehiclesRouter);

//middleware
app.use(globalErrorHandler);
app.use(notFound);
export default app;
