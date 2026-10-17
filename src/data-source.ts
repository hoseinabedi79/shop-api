import 'reflect-metadata';
import { DataSource } from 'typeorm';

// The TypeORM CLI runs outside Nest, so it cannot use ConfigService.
// TypeORM 1.x no longer reads .env by itself, so we load it with Node's built-in loader.
process.loadEnvFile();

// Read a required variable or stop with a clear error, like ConfigService.getOrThrow
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export default new DataSource({
  type: 'postgres',
  host: requireEnv('DB_HOST'),
  port: Number(requireEnv('DB_PORT')),
  username: requireEnv('DB_USERNAME'),
  password: requireEnv('DB_PASSWORD'),
  database: requireEnv('DB_NAME'),
  // Find every entity file, both as .ts (CLI) and .js (compiled build)
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  // Where migration files live
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  // Never let TypeORM change the schema on its own
  synchronize: false,
});