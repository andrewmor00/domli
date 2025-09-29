import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { pool } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create migrations table if it doesn't exist
const createMigrationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ Migrations table created/verified");
  } catch (error) {
    console.error("❌ Error creating migrations table:", error);
    throw error;
  }
};

// Get list of executed migrations
const getExecutedMigrations = async () => {
  try {
    const result = await pool.query("SELECT name FROM migrations ORDER BY id");
    return result.rows.map((row) => row.name);
  } catch (error) {
    console.error("❌ Error getting executed migrations:", error);
    throw error;
  }
};

// Execute a migration
const executeMigration = async (migrationName, migrationContent) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Execute the migration
    await client.query(migrationContent);

    // Record the migration
    await client.query("INSERT INTO migrations (name) VALUES ($1)", [
      migrationName,
    ]);

    await client.query("COMMIT");
    console.log(`✅ Executed migration: ${migrationName}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ Error executing migration ${migrationName}:`, error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations
const runMigrations = async () => {
  try {
    console.log("🚀 Starting database migrations...");

    // Create migrations table
    await createMigrationsTable();

    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();

    // Get migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    let executedCount = 0;

    for (const file of migrationFiles) {
      const migrationName = file;

      if (executedMigrations.includes(migrationName)) {
        console.log(
          `⏭️  Skipping already executed migration: ${migrationName}`
        );
        continue;
      }

      const migrationPath = path.join(migrationsDir, file);
      const migrationContent = fs.readFileSync(migrationPath, "utf8");

      await executeMigration(migrationName, migrationContent);
      executedCount++;
    }

    console.log(
      `🎉 Migrations completed! Executed ${executedCount} new migrations`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (process.argv[1] && process.argv[1].includes("run-migrations.js")) {
  runMigrations();
}
