import Joi from "joi";

export const analyzeProfitDto = Joi.object({
  ticker: Joi.string().required().trim().uppercase(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
});
