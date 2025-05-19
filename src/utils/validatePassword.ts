import validator from "validator";

export const validatePassword = (password: string): boolean => {
  // At least 6 chars, 1 number, 1 lowercase, 1 uppercase
  return validator.isStrongPassword(password, {
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  });
};
