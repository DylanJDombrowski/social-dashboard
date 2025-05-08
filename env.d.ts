// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    TWITCH_CLIENT_ID: string;
    TWITCH_CLIENT_SECRET: string;
    NEXT_PUBLIC_BASE_URL?: string;
    NODE_ENV: "development" | "production" | "test";
  }
}
