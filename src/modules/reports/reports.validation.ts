import Joi from "joi";

const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(
  now.getMonth() + 1,
).padStart(2, "0")}`;

export const monthlyRentalsQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .default(currentMonth)
    .messages({
      "string.pattern.base": "month must be in YYYY-MM format",
    }),
  vehicle_id: Joi.number().integer().positive(),
});
