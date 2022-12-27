import { hash } from "bcryptjs";

const hashPassword = (password: string) => {
  if (password.length < 8) {
    throw new Error("password should be at least 8 chars");
  }
  return hash(password, 10);
};

export { hashPassword };
