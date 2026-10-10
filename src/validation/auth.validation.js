import joi from "joi";

export const createUserSchema = joi . object({
    username : joi.string().trim().min(3).max(30).required().messages({
        "any.empty": "Username is required",
        "any.min": "Username must be at least 3 characters long",
        "any.max": "Username must be at most 30 characters long"
    }),
    email : joi.string().trim().email().required().messages({
        "any.empty": "Email is required",
        "any.email": "Please enter a valid email"
    }),
    password : joi.string().trim().min(6).pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required().messages({
        "any.empty": "Password is required",
        "any.min": "Password must be at least 6 characters long",
        "any.pattern.base": "Password must contain only letters and numbers"
    }),
    confirm_password : joi.string().valid(joi.ref('password')).required().messages({
        "any.empty": "Confirm password is required",
        "any.only": "Confirm password must match the password"
    }),
    role : joi.string().valid('user', 'admin').default('user').required()
});
export const loginUserSchema = joi.object({
      email : joi.string().trim().email().required().messages({
        "any.empty": "Email is required",
        "any.email": "Please enter a valid email"
    }),
    password : joi.string().trim().min(6).pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')).required().messages({
        "any.empty": "Password is required",
        "any.min": "Password must be at least 6 characters long",
        "any.pattern.base": "Password must contain only letters and numbers"
    })
})
