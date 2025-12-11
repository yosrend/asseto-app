# Asseto - AI Design Asset Generator

> Revolutionary platform for UI/UX designers to create 10+ professional images per section in minutes with AI

Asseto leverages Google Gemini's advanced AI capabilities to transform your design workflow. Create high-quality, consistent design assets with AI-powered description refinement, style transfer from reference images, and intelligent section auto-fill.

**90% faster** asset creation (5 hours → 5 minutes) with **style consistency** across your entire project.

## ✨ Key Features

### 🎨 **AI-Powered Intelligence**
- **Smart Description Refinement**: AI enhances your descriptions for better image generation
- **Image Reference Style Transfer**: Upload 1-3 reference images to extract and apply unique visual styles
- **Auto-Fill Section Details**: AI generates context-specific guidance for each section (Hero, Pricing, Features, etc.)
- **Multi-format Generation**: Create assets using Google Gemini 2.5 Flash Image model

### ⚡ **Streamlined Workflow**
- **Single-Page Interface**: All settings in one scrollable sidebar, gallery on the right
- **Real-Time Generation**: See images appear as they generate with blur-to-clear effect
- **Batch Processing**: Generate 10+ images per section simultaneously
- **Custom Categories**: Define your own project types beyond standard templates

### 📦 **Export & Sharing**
- **Copy to Clipboard**: One-click copy any image directly to your clipboard
- **Multiple Formats**: Download in PNG (lossless), JPG (compressed), or WebP (modern)
- **Section Downloads**: Download entire sections as ZIP files
- **Bulk Export**: Export all sections at once

### 🎯 **Professional Quality**
- **Flexible Dimensions**: Support for 16:9, 1:1, 9:16, and custom aspect ratios
- **Quality Tiers**: Choose from 1K, 2K, or 4K resolution
- **Style Consistency**: Maintain uniform visual language across all assets
- **Project Organization**: Organize images by sections with smart categorization

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Google Gemini API Key ([Get one from Google AI](https://ai.google.dev/gemini-api/docs/api-key))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yosrend/asseto-app.git
   cd asseto-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **AI Integration**: 
  - Google Gemini 2.5 Flash Image (image generation)
  - Google Gemini 2.5 Flash (description refinement, auto-fill)
  - Google Gemini Vision (style extraction from reference images)
- **Database**: Neon PostgreSQL (serverless)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Processing**: JSZip for batch downloads
- **State Management**: React Hooks
- **Environment**: Node.js 18+

## 📖 How It Works

### Single-Page Workflow

```
┌─────────────────────────────────────────────┐
│         ASSETO DASHBOARD                    │
├────────────────┬────────────────────────────┤
│  LEFT SIDEBAR  │  CENTER/RIGHT GALLERY      │
│  (Settings)    │  (Generated Images)        │
│                │                            │
│ 1. Website     │  [Section: Hero]           │
│    Category    │  ┌──────┬──────┬──────┐   │
│    Custom Type │  │ Img1 │ Img2 │ Img3 │   │
│    Description │  │ [📋] │ [📋] │ [📋] │   │
│    [AI Refine] │  └──────┴──────┴──────┘   │
│                │  [Download Section] [All]  │
│ 2. Style       │                            │
│    - Preset    │  [Section: Features]       │
│    - Image Ref │  ┌──────┬──────┬──────┐   │
│    [Extract]   │  │ Img1 │ Img2 │ Img3 │   │
│                │  └──────┴──────┴──────┘   │
│ 3. Sections    │                            │
│    [Auto-Fill] │  ... (more sections)       │
│    Add/Remove  │                            │
│                │                            │
│ 4. Settings    │                            │
│    Quality     │                            │
│    Dimensions  │                            │
│    [Generate]  │                            │
└────────────────┴────────────────────────────┘
```

### Step-by-Step Usage

#### 1. **Setup Your Project**
- **Choose Category**: Select from ECommerce, SaaS, Blog, Portfolio, Agency, or create custom
- **Describe Your Project**: Enter a brief description
- **Refine with AI** ✨: Click to enhance your description with AI-powered suggestions

#### 2. **Define Your Style**
- **Option A - Preset Styles**: Choose from Realistic, Illustration, 3D, Cartoon, Minimalist, etc.
- **Option B - Image Reference**: Upload 1-3 reference images
  - AI automatically extracts visual style (lighting, color palette, composition)
  - Edit the extracted prompt to fine-tune
  - Apply consistently across all generations

#### 3. **Organize Sections**
- **Add Sections**: Create sections like Hero, Features, Pricing, About, CTA
- **Auto-Fill Details** ✨: AI generates context-specific guidance for each section
- **Set Image Count**: Choose 1-10 images per section

#### 4. **Generate & Download**
- **Generate All**: Click to start batch generation
- **Watch Real-Time**: Images appear with blur-to-clear effect as they generate
- **Copy to Clipboard** 📋: Click any image to copy instantly
- **Download Options**:
  - Individual images
  - Section as ZIP
  - All sections as ZIP
  - Choose format: PNG, JPG, or WebP

## 🎯 Key Workflows

### Workflow 1: Quick Generation with Presets
```
1. Select category (e.g., "E-Commerce")
2. Enter description
3. Choose "Realistic Photography" style
4. Add 3 sections (Hero, Products, CTA)
5. Set quality to 2K
6. Click "Generate All"
7. Download all as ZIP
⏱️ Total time: ~5 minutes
```

### Workflow 2: Style Transfer from Reference
```
1. Select "Custom" category: "Pet Adoption Platform"
2. Write description, click "AI Refine"
3. Choose "Image Reference" style
4. Upload 2-3 brand photos
5. AI extracts style prompt
6. Review/edit prompt
7. Add sections with Auto-Fill
8. Generate and download
⏱️ Total time: ~7 minutes
```

### Workflow 3: Section-by-Section Creation
```
1. Setup project basics
2. Add first section (Hero)
3. Click "Auto-Fill" for AI suggestions
4. Generate Hero section only
5. Review results, copy best to clipboard
6. Add next section (Features)
7. Repeat for each section
⏱️ Iterative workflow
```

## 💾 Database Setup

Asseto uses **Neon PostgreSQL** for storing projects, sections, and generated images.

### Database Commands

```bash
# Test database connection
npm run db:test

# Run migrations (create tables)
npm run db:migrate

# View database schema
See db/schema.sql for complete structure
```

### Database Schema

- **projects**: Store project configurations (name, description, category, style settings)
- **sections**: Organize project sections (Hero, Features, etc.)
- **generated_images**: Store AI-generated images with metadata
- **style_references**: Store uploaded reference images and extracted style prompts

## 🎨 Image Quality & Formats

### Quality Tiers
- **1K** (1024x1024): Fast generation (~15-20 sec), suitable for previews
- **2K** (2048x2048): Balanced quality (~25-30 sec), professional use
- **4K** (4096x4096): Premium quality (~35-45 sec), ultra-detailed

### Export Formats
- **PNG**: Lossless, best for graphics with transparency
- **JPG**: Compressed, smaller file size, best for photos
- **WebP**: Modern format, better compression than JPG

### Aspect Ratios
- 16:9 (Landscape - Hero sections)
- 1:1 (Square - Social media, thumbnails)
- 9:16 (Portrait - Mobile-first)
- 3:2, 4:5, 5:4 (Classic portraits)
- 3:1 (Ultra-wide banners)

## 🚀 Advanced Features

### AI Description Refinement
Enhance your project descriptions with AI-powered suggestions. The system analyzes your input and provides a more detailed, visually-rich description optimized for image generation.

### Style Extraction from Images
Upload 1-3 reference images and let AI extract:
- Color palette and mood
- Lighting and composition style
- Artistic technique and texture
- Visual atmosphere

### Section Auto-Fill
AI generates context-specific guidance for each section type:
- **Hero**: Suggests impactful visual elements
- **Features**: Recommends icon styles and layouts
- **Pricing**: Advises on card designs and hierarchy
- **About**: Suggests team photo styles
- **CTA**: Recommends button and background styles

## 🤖 AI Agent Orchestration

Asseto includes an advanced AI agent orchestration system for complex development tasks. See [AGENTS.md](./AGENTS.md) for complete documentation on:

- Multi-agent coordination
- Specialized droids (Frontend, AI Integration, Testing, etc.)
- Task automation patterns
- Quality gates and validation

## 🎯 Success Metrics

### Performance Goals
- ⚡ Generate 10+ images per section in under 5 minutes
- 🎨 98%+ download success rate
- 📋 100% clipboard copy success
- 💨 Sub-2 second page load time

### Quality Metrics
- AI refinement acceptance rate: 70%+
- Style extraction accuracy: 90%+
- Section auto-fill accuracy: 85%+
- Real-time preview adoption: 80%+

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Powered by [Google Gemini API](https://ai.google.dev/) - Image generation, style extraction, and AI refinement
- Database by [Neon](https://neon.tech/) - Serverless PostgreSQL
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## 🔗 Links

- **Documentation**: [AGENTS.md](./AGENTS.md) - AI orchestration system
- **Database Schema**: [db/schema.sql](./db/schema.sql) - Complete database structure
- **PRD**: [asseto-updated-prd.md](./asseto-updated-prd.md) - Product requirements

---

**Version**: 2.0  
**Status**: ✅ Ready for Development  
**Last Updated**: December 2025
