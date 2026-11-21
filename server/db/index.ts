import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { config } from "dotenv";
import WebSocket from "ws";
import * as schema from "./schema";

config({ path: ".env.local" });
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured for the server.");
}

neonConfig.webSocketConstructor = WebSocket;

const pool = new Pool({ connectionString });

export const db = drizzle({ client: pool, schema });
