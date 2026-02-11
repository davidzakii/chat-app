import Joi from "joi";

export const registerUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(3).max(30).required(),
  profilePic: Joi.string().uri().optional(),
}).min(3);

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).min(2);

export const forgotPasswordUserSchema = Joi.object({
  email: Joi.string().email().required(),
}).max(1);

export const resetPasswordUserSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
}).max(2);

export const logoutSchema = Joi.object({}).max(0);

export const updateUserSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).optional(),
  profilePic: Joi.string().uri().optional(),
}).min(1);

export const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
}).max(2);
