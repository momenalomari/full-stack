import Joi from "joi";

const proposalFields = {
  price: Joi.number().positive().precision(2),
  delivery_days: Joi.number().integer().positive(),
  cover_letter: Joi.string().trim().min(20).max(10000),
  technologies: Joi.string().trim().max(2000).allow(""),
};

export const createProposalSchema = Joi.object({
  ...proposalFields,
  price: proposalFields.price.required(),
  delivery_days: proposalFields.delivery_days.required(),
  cover_letter: proposalFields.cover_letter.required(),
});

export const updateProposalSchema = Joi.object(proposalFields).min(1);
