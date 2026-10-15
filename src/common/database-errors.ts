import { QueryFailedError } from 'typeorm';

// PostgreSQL error codes we handle explicitly
export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
// Raised by foreign keys with ON DELETE RESTRICT on newer PostgreSQL versions
export const PG_RESTRICT_VIOLATION = '23001';

// Returns the PostgreSQL error code, or undefined for non-database errors
export function getPgErrorCode(error: unknown): string | undefined {
  if (!(error instanceof QueryFailedError)) {
    return undefined;
  }
  return (error.driverError as { code?: string }).code;
}
