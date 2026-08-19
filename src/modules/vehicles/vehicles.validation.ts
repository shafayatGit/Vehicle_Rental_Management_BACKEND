import Joi from "joi";

export const createVehicleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  plate_number: Joi.string().trim().min(1).max(20).required(),
  category: Joi.string().trim().min(1).max(50).required(),
  daily_rate: Joi.number().positive().precision(2).required(),
});

export const updateVehicleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),
  plate_number: Joi.string().trim().min(1).max(20),
  category: Joi.string().trim().min(1).max(50),
  daily_rate: Joi.number().positive().precision(2),
}).min(1);

export const listVehiclesQuerySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(10),
  category: Joi.string().trim().min(1).max(50),
  search: Joi.string().trim().min(1).max(100),
});
