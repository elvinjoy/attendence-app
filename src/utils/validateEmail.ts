import validator from "validator";

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};
