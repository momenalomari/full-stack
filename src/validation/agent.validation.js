import Joi from "joi";

export const agentRequestSchema = Joi.object({
  mode: Joi.string()
    .valid("project_brief", "proposal", "marketplace_support", "admin_insights")
    .required(),
  message: Joi.string().trim().min(3).max(4000).required(),
  project_id: Joi.number().integer().positive().when("mode", {
    is: "proposal",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  skills: Joi.string().trim().max(800).allow("").optional(),
});
