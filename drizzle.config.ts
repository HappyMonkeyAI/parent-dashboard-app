import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  // Drizzle migrations for the containerised Postgres deployment.
  // The Supabase-flavoured SQL in ./supabase/migrations is a separate, inactive path.
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
