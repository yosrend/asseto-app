import React, { useState, useEffect } from 'react';
import { ProjectState, ProjectConfig, GenerationStatus, GeneratedImage, ImageStatus } from './types';
import { SidebarSettings } from './components/SidebarSettings';
import { Gallery } from './components/Gallery';
import { generateImageForSection, regenerateImage } from './services/geminiService';
import { DEFAULT_SECTIONS, STYLE_PRESETS, ASPECT_RATIOS, CATEGORY_PRESETS } from './constants';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [state, setState] = useState<ProjectState>({
    config: {
      name: 'New Project',
      category: CATEGORY_PRESETS[0],
      description: '',
      style: STYLE_PRESETS[0],
      aspectRatio: ASPECT_RATIOS[0].value,
      sections: DEFAULT_SECTIONS.map(s => ({ ...s, id: crypto.randomUUID() }))
    },
    images: [],
    status: GenerationStatus.IDLE,
    progress: 0
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const updateConfig = (newConfig: ProjectConfig) => {
    setState(prev => ({ ...prev, config: newConfig }));
  };

  const handleGenerate = async () => {
    if (!state.config.name) return;

    // 1. Create Placeholders
    const newImages: GeneratedImage[] = [];
    const operations: Promise<void>[] = [];
    
    // Clear old images for a fresh start based on the sidebar "Generate" button.
    state.config.sections.forEach(section => {
      for (let i = 0; i < section.imageCount; i++) {
        const placeholderId = crypto.randomUUID();
        const placeholder: GeneratedImage = {
          id: placeholderId,
          sectionId: section.id,
          prompt: '',
          createdAt: Date.now(),
          status: ImageStatus.PENDING
        };
        newImages.push(placeholder);

        // 2. Queue Operations
        const op = generateImageForSection(state.config, section, placeholderId)
          .then(completedImage => {
             setState(prev => ({
               ...prev,
               images: prev.images.map(img => img.id === placeholderId ? completedImage : img)
             }));
          });
        operations.push(op);
      }
    });

    setState(prev => ({
      ...prev,
      images: newImages, // Replace with new batch of placeholders
      status: GenerationStatus.GENERATING
    }));

    try {
      await Promise.allSettled(operations);
      setState(prev => ({ ...prev, status: GenerationStatus.COMPLETED }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, status: GenerationStatus.FAILED }));
    }
  };

  const handleRegenerate = async (image: GeneratedImage) => {
     const newImage = await regenerateImage(state.config, image);
     setState(prev => ({
       ...prev,
       images: prev.images.map(img => img.id === image.id ? newImage : img)
     }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <SidebarSettings 
        config={state.config}
        onChange={updateConfig}
        onGenerate={handleGenerate}
        isGenerating={state.status === GenerationStatus.GENERATING}
      />
      <Gallery 
        config={state.config}
        images={state.images}
        onRegenerate={handleRegenerate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};

export default App;