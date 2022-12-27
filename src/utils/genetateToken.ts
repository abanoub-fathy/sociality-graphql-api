import jwt from "jsonwebtoken";

const generateToken = (userId: string) => {
  let JWT_SECRET = process.env.JWT_SECRET;
  if (JWT_SECRET == undefined) {
    throw new Error("can not generate token");
  }
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

export { generateToken };
