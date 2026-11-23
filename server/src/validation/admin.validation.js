import Joi from "joi";

export const updateUserSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  role: Joi.string().valid("user", "moderator", "admin").required(),
  is_active: Joi.boolean().required(),
}).required();
