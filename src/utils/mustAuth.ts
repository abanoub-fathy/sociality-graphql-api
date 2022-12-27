import getUserId, { AuthUser } from "./getUserId";

// mustAuth is used to ensure that the user is authenticated
// if the token is undefined or empty string it is going to
// throw an error
//
// also if the authentication process failed it is going
// to throw an error with the message from getUserId func
export const mustAuth = (authToken: string | undefined): AuthUser => {
  if (authToken == undefined || authToken == "") {
    throw new Error("Authentication Required");
  }

  const userAuth = getUserId(authToken);
  if (!userAuth.userAuthenticated) {
    throw new Error(userAuth.error);
  }

  return userAuth;
};
