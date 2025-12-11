import 'dotenv/config';
import { sql } from '../services/database';

/**
 * Test CRUD operations on Neon database
 */
async function testCRUD() {
  console.log('🧪 Testing CRUD operations...\n');

  try {
    // CREATE - Insert test project
    console.log('1️⃣ Testing CREATE...');
    const [newProject] = await sql`
      INSERT INTO projects (
        name, 
        description, 
        category, 
        style, 
        aspect_ratio,
        width,
        height
      ) VALUES (
        'Test E-Commerce Project',
        'A modern online store for fashion products',
        'ecommerce',
        'Realistic Photography',
        '16:9',
        1920,
        1080
      )
      RETURNING *
    `;
    console.log('✅ Project created:', {
      id: newProject.id,
      name: newProject.name,
      category: newProject.category
    });

    // READ - Select the project
    console.log('\n2️⃣ Testing READ...');
    const projects = await sql`
      SELECT * FROM projects 
      WHERE name = 'Test E-Commerce Project'
      LIMIT 1
    `;
    console.log('✅ Project retrieved:', projects[0]?.name);

    // CREATE - Insert section
    console.log('\n3️⃣ Testing CREATE section...');
    const [newSection] = await sql`
      INSERT INTO sections (
        project_id,
        name,
        description,
        order_index
      ) VALUES (
        ${newProject.id},
        'Hero Section',
        'Main landing page hero with CTA',
        0
      )
      RETURNING *
    `;
    console.log('✅ Section created:', newSection.name);

    // UPDATE - Update project
    console.log('\n4️⃣ Testing UPDATE...');
    await sql`
      UPDATE projects 
      SET description = 'Updated description - Premium fashion store'
      WHERE id = ${newProject.id}
    `;
    const [updatedProject] = await sql`
      SELECT * FROM projects WHERE id = ${newProject.id}
    `;
    console.log('✅ Project updated:', updatedProject.description);

    // READ - Join query
    console.log('\n5️⃣ Testing JOIN query...');
    const projectWithSections = await sql`
      SELECT 
        p.name as project_name,
        s.name as section_name,
        s.order_index
      FROM projects p
      LEFT JOIN sections s ON p.id = s.project_id
      WHERE p.id = ${newProject.id}
      ORDER BY s.order_index
    `;
    console.log('✅ Join query result:', projectWithSections);

    // DELETE - Clean up (cascade will delete sections too)
    console.log('\n6️⃣ Testing DELETE...');
    await sql`
      DELETE FROM projects WHERE id = ${newProject.id}
    `;
    console.log('✅ Project deleted (cascaded to sections)');

    // Verify deletion
    const deletedProject = await sql`
      SELECT * FROM projects WHERE id = ${newProject.id}
    `;
    console.log('✅ Verified deletion:', deletedProject.length === 0 ? 'Success' : 'Failed');

    console.log('\n✅ All CRUD operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ CRUD test failed:', error);
    process.exit(1);
  }
}

testCRUD();
