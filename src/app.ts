import express, { Request, Response } from "express";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Vehicle Rental API is running",
  });
});

//middleware
app.use(globalErrorHandler);
app.use(notFound);
export default app;
