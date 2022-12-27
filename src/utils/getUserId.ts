import jwt from "jsonwebtoken";

export interface AuthUser {
  userAuthenticated: boolean;
  userId: string;
  error: string;
}

const getUserId = (authToken: string | undefined) => {
  if (authToken === "" || authToken == undefined) {
    return {
      userAuthenticated: false,
      userId: "",
      error: "authToken is undefined",
    } as AuthUser;
  }

  let JWT_SECRET = process.env.JWT_SECRET;
  if (JWT_SECRET == undefined) {
    return {
      userAuthenticated: false,
      userId: "",
      error: "can not verify token",
    } as AuthUser;
  }

  try {
    const token = authToken.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };
    return {
      userAuthenticated: true,
      userId: payload.userId,
      error: "",
    } as AuthUser;
  } catch (e) {
    return {
      userAuthenticated: false,
      userId: "",
      error: e,
    } as AuthUser;
  }
};

export default getUserId;
