import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL || '');

/**
 * Database service for Asseto
 * Provides connection to Neon PostgreSQL database
 */
export class DatabaseService {
  /**
   * Execute a raw SQL query
   * @param query SQL query string
   * @param params Query parameters
   */
  static async query<T = any>(query: string, params?: any[]): Promise<T[]> {
    try {
      const result = await sql(query, params);
      return result as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const result = await sql`SELECT NOW() as current_time`;
      console.log('✅ Database connected successfully:', result[0]);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Get database version
   */
  static async getVersion(): Promise<string> {
    try {
      const result = await sql`SELECT version()`;
      return result[0].version;
    } catch (error) {
      console.error('Error getting database version:', error);
      throw error;
    }
  }
}

// Export the sql instance for direct queries
export { sql };

export default DatabaseService;
