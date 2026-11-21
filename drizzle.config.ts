import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running Drizzle Kit.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  tablesFilter: ["hostel_student", "hostel_complaint"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
