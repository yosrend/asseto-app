# Asseto - AI Design Asset Generator

> Professional AI-powered asset generator for UI/UX designers

Asseto leverages Google Gemini's advanced image generation capabilities to create high-quality design assets tailored for UI/UX projects. Generate hero images, backgrounds, icons, and more with customizable styles and dimensions.

## ✨ Features

- **AI-Powered Generation**: Create professional design assets using Google Gemini 2.5 Flash Image model
- **Style Customization**: Extract and apply styles from reference images
- **Custom Dimensions**: Flexible aspect ratios including custom width/height
- **Batch Generation**: Generate multiple assets at once with parallel processing
- **Project Management**: Organize assets by sections and download as ZIP
- **Real-time Preview**: Instant preview of generated images with regeneration capability

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
- **AI Integration**: Google Gemini API (gemini-2.5-flash-image)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Processing**: JSZip for batch downloads

## 📖 Usage

1. **Configure Project**: Enter project name, description, and select design category
2. **Add Sections**: Define sections for your project (Hero, Features, etc.)
3. **Customize Style**: Choose from preset themes or upload reference images
4. **Generate Assets**: Click generate to create AI-powered design assets
5. **Download**: Export individual images or download all as ZIP

## 🤖 AI Agent Orchestration

Asseto includes an advanced AI agent orchestration system for complex development tasks. See [AGENTS.md](./AGENTS.md) for complete documentation on:

- Multi-agent coordination
- Specialized droids (Frontend, AI Integration, Testing, etc.)
- Task automation patterns
- Quality gates and validation

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Powered by [Google Gemini API](https://ai.google.dev/)
- Built with [React](https://react.dev/) and [Vite](https://vitejs.dev/)
