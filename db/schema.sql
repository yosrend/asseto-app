-- Asseto Database Schema
-- Neon PostgreSQL Database

-- Create projects table
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
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  image_url TEXT,
  image_data TEXT, -- Base64 encoded image data
  prompt TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create style_references table
CREATE TABLE IF NOT EXISTS style_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL, -- Base64 encoded reference image
  extracted_style TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sections_project_id ON sections(project_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_generated_images_project ON generated_images(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_section ON generated_images(section_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_status ON generated_images(status);
CREATE INDEX IF NOT EXISTS idx_style_references_project ON style_references(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_images_updated_at
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE projects IS 'Stores user projects with configuration';
COMMENT ON TABLE sections IS 'Project sections for organizing generated assets';
COMMENT ON TABLE generated_images IS 'AI-generated images with metadata';
COMMENT ON TABLE style_references IS 'Reference images for style extraction';
