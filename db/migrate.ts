import 'dotenv/config';
import { sql } from '../services/database';

/**
 * Run database migrations
 * Creates all necessary tables for Asseto
 */
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        custom_category VARCHAR(255),
        style VARCHAR(50),
        style_prompt TEXT,
        aspect_ratio VARCHAR(20),
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create sections table
    await sql`
      CREATE TABLE IF NOT EXISTS sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create generated_images table
    await sql`
      CREATE TABLE IF NOT EXISTS generated_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
        image_url TEXT,
        image_data TEXT,
        prompt TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        error_message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create style_references table
    await sql`
      CREATE TABLE IF NOT EXISTS style_references (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        image_data TEXT NOT NULL,
        extracted_style TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sections_project_id ON sections(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(project_id, order_index)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_generated_images_project ON generated_images(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_generated_images_section ON generated_images(section_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_style_references_project ON style_references(project_id)`;

    // Create trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    // Create triggers
    await sql`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
      CREATE TRIGGER update_sections_updated_at
        BEFORE UPDATE ON sections
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_generated_images_updated_at ON generated_images;
      CREATE TRIGGER update_generated_images_updated_at
        BEFORE UPDATE ON generated_images
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('✅ Migrations completed successfully!');
    console.log('\nTables created:');
    console.log('  - projects');
    console.log('  - sections');
    console.log('  - generated_images');
    console.log('  - style_references');

    // Test connection
    const result = await sql`SELECT 
      table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name`;

    console.log('\n📊 Current tables in database:');
    result.forEach((row: any) => {
      console.log(`  - ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
