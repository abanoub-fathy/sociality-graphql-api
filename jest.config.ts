import type { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    globalSetup: "./tests/jest/globalSetup.js",
    globalTeardown: "./tests/jest/globalTeardown.js",
  };
};
