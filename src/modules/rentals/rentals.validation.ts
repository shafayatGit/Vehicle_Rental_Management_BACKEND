import Joi from "joi";

const dateOnly = (label: string) =>
  Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    .custom((value: string, helpers) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      if (
        Number.isNaN(date.getTime()) ||
        date.toISOString().slice(0, 10) !== value
      ) {
        return helpers.message({
          custom: `${label} must be a valid date in YYYY-MM-DD format`,
        });
      }
      return value;
    }, "YYYY-MM-DD date");

export const rentalStatuses = [
  "booked",
  "ongoing",
  "completed",
  "cancelled",
] as const;

const dateOrderCheck = (
  value: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) => {
  const { start_date: startDate, end_date: endDate } = value;
  if (
    typeof startDate === "string" &&
    typeof endDate === "string" &&
    startDate > endDate
  ) {
    return helpers.message({
      custom: "end_date must be on or after start_date",
    });
  }
  return value;
};

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  customer_name: Joi.string().trim().min(1).max(100).required(),
  customer_phone: Joi.string().trim().min(1).max(30).required(),
  start_date: dateOnly("start_date").required(),
  end_date: dateOnly("end_date").required(),
}).custom(dateOrderCheck);

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string().trim().min(1).max(100),
  customer_phone: Joi.string().trim().min(1).max(30),
  start_date: dateOnly("start_date"),
  end_date: dateOnly("end_date"),
  status: Joi.string().valid(...rentalStatuses),
}).custom(dateOrderCheck);

export const listRentalsQuerySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(10),
  vehicle_id: Joi.number().integer().positive(),
  status: Joi.string().valid(...rentalStatuses),
  start_date: dateOnly("start_date"),
  end_date: dateOnly("end_date"),
});
