import 'dotenv/config';
import DatabaseService, { sql } from '../services/database';

/**
 * Test database connection
 */
async function testConnection() {
  console.log('🔍 Testing Neon database connection...\n');

  try {
    // Test basic connection
    const connected = await DatabaseService.testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Get database version
    console.log('\n📌 Getting database version...');
    const version = await DatabaseService.getVersion();
    console.log(`PostgreSQL Version: ${version.split(',')[0]}`);

    // List tables
    console.log('\n📊 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('ℹ️  No tables found. Run migrations first: npm run db:migrate');
    } else {
      console.log('Tables in database:');
      tables.forEach((row: any) => {
        console.log(`  ✓ ${row.table_name}`);
      });
    }

    console.log('\n✅ Database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
