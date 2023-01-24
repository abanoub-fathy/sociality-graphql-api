export const getFirstName = (fullName: string): string => {
  return fullName.split(" ")[0];
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && !password.toLowerCase().includes("password");
};
