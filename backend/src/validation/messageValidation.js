import Joi from "joi";

export const sendMessageSchema = Joi.object({
  text: Joi.string().required(),
  image: Joi.string().uri().optional(),
}).min(1);
