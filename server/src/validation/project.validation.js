import Joi from "joi";

export const createProjectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(150).required(),

  description: Joi.string().trim().min(20).required(),

  budget: Joi.number().positive().precision(2).required(),

  category_id: Joi.number().integer().positive().required(),

  deadline: Joi.date().iso().greater("now").required(),
});

export const updateProjectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(150),
  description: Joi.string().trim().min(20),
  budget: Joi.number().positive().precision(2),
  category_id: Joi.number().integer().positive(),
  deadline: Joi.date().iso().greater("now"),
}).min(1);
