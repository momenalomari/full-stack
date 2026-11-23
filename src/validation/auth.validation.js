import Joi from "joi";

// REGISTER VALIDATION
export const createUserSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must be at most 30 characters long",
    "any.required": "Username is required",
  }),

  email: Joi.string().trim().lowercase().email().max(254).required().messages({
    "string.empty": "Email is required",
    "string.email": "Please enter a valid email",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(6).max(30).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password must be at most 30 characters long",
    "any.required": "Password is required",
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.empty": "Confirm password is required",
    "any.only": "Confirm password must match the password",
    "any.required": "Confirm password is required",
  }),
});

// LOGIN VALIDATION
export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),

  password: Joi.string().required(),
});
