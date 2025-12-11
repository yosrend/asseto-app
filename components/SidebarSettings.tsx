import React, { useState, useRef, useEffect } from 'react';
import { ProjectConfig, SectionConfig } from '../types';
import { STYLE_PRESETS, CATEGORY_PRESETS, ASPECT_RATIOS } from '../constants';
import { 
  Plus, Trash2, Wand2, Sparkles, Upload, 
  LayoutTemplate, Ratio, Type, Image as ImageIcon, Loader2, X, ImagePlus
} from 'lucide-react';
import { refineDescription, generateSectionDetails, extractStyleFromImages } from '../services/geminiService';

interface SidebarSettingsProps {
  config: ProjectConfig;
  onChange: (newConfig: ProjectConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

// --- Modal Component ---
interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (images: string[]) => void;
  isAnalyzing: boolean;
}

const ReferenceImageModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose, onAnalyze, isAnalyzing }) => {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen) return;
      if (e.clipboardData?.items) {
        const items = Array.from(e.clipboardData.items);
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (ev.target?.result && images.length < 3) {
                  setImages(prev => [...prev, ev.target!.result as string].slice(0, 3));
                }
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, images]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 3 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];
      
      filesToProcess.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setImages(prev => [...prev, ev.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <ImagePlus size={24} className="text-purple-400"/> Reference Style
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Upload or paste up to 3 images. AI will analyze them to extract a unified visual style for your project.
        </p>

        {/* Drop/Preview Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center transition-colors ${
            images.length < 3 ? 'border-zinc-700 hover:border-purple-500/50 hover:bg-zinc-800/50 cursor-pointer' : 'border-zinc-800 bg-zinc-900 cursor-default'
          }`}
          onClick={() => images.length < 3 && fileInputRef.current?.click()}
        >
          {images.length === 0 ? (
            <div className="text-center space-y-2">
              <Upload className="mx-auto text-zinc-500" size={32} />
              <p className="text-sm text-zinc-300">Click to upload or <span className="text-purple-400">Ctrl+V</span> to paste</p>
              <p className="text-xs text-zinc-600">Supports PNG, JPG, WEBP</p>
            </div>
          ) : (
             <div className="grid grid-cols-3 gap-4 w-full" onClick={(e) => e.stopPropagation()}>
               {images.map((img, idx) => (
                 <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                    <img src={img} alt="Reference" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                 </div>
               ))}
               {images.length < 3 && (
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-purple-400 hover:border-purple-500 hover:bg-zinc-800 cursor-pointer transition-all"
                 >
                    <Plus size={24} />
                 </div>
               )}
             </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple
            onChange={handleFileUpload}
          />
        </div>

        <div className="flex justify-between items-center">
           <span className="text-xs text-zinc-500">{images.length}/3 images selected</span>
           <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800"
             >
               Cancel
             </button>
             <button 
               onClick={() => onAnalyze(images)}
               disabled={images.length === 0 || isAnalyzing}
               className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
             >
               {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
               Analyze & Apply Style
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Sidebar Component ---

export const SidebarSettings: React.FC<SidebarSettingsProps> = ({ config, onChange, onGenerate, isGenerating }) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);

  // Helper to update specific fields
  const updateConfig = (key: keyof ProjectConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const updateSection = (id: string, field: keyof SectionConfig, value: any) => {
    const newSections = config.sections.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateConfig('sections', newSections);
  };

  const addSection = () => {
    const newSection: SectionConfig = {
      id: crypto.randomUUID(),
      name: "New Section",
      description: "",
      imageCount: 2
    };
    updateConfig('sections', [...config.sections, newSection]);
  };

  const removeSection = (id: string) => {
    updateConfig('sections', config.sections.filter(s => s.id !== id));
  };

  // AI Actions
  const handleRefineDescription = async () => {
    if (!config.description) return;
    setLoadingAction('refine');
    try {
      const refined = await refineDescription(config.description);
      updateConfig('description', refined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAutoFillSection = async (sectionId: string, sectionName: string) => {
    if (!sectionName) return;
    setLoadingAction(`autofill-${sectionId}`);
    try {
      const context = config.customCategory || config.category;
      const details = await generateSectionDetails(sectionName, context);
      updateSection(sectionId, 'description', details);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAnalyzeReference = async (images: string[]) => {
    setLoadingAction('analyze-style');
    try {
      const stylePrompt = await extractStyleFromImages(images);
      updateConfig('style', 'Image Reference');
      updateConfig('stylePrompt', stylePrompt);
      setIsRefModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <aside className="w-96 bg-zinc-900 border-r border-zinc-800 h-screen overflow-y-auto flex flex-col shadow-xl z-20">
        <div className="p-5 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Sparkles size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Asseto</h1>
          </div>
          <p className="text-xs text-zinc-500 ml-10">AI Design Asset Generator</p>
        </div>

        <div className="p-5 space-y-8 flex-1">
          
          {/* Project Info */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Type size={14} /> Project Context
            </h2>
            
            <div className="space-y-3">
              <input 
                type="text"
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
                placeholder="Project Name"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />

              <div className="relative">
                <select 
                  value={config.category === 'Custom' ? 'Custom' : config.category}
                  onChange={(e) => updateConfig('category', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none appearance-none"
                >
                  {CATEGORY_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Custom">Custom Category...</option>
                </select>
              </div>
              
              {(config.category === 'Custom' || config.customCategory) && (
                <input 
                  type="text"
                  value={config.customCategory || ''}
                  onChange={(e) => {
                      updateConfig('category', 'Custom');
                      updateConfig('customCategory', e.target.value);
                  }}
                  placeholder="Type your category..."
                  className="w-full bg-zinc-900 border border-blue-900/50 rounded-lg px-3 py-2 text-sm text-blue-100 placeholder-blue-500/50 focus:outline-none focus:border-blue-500"
                />
              )}

              <div className="relative">
                <textarea 
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  placeholder="Project brief..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px] resize-none pr-8"
                />
                <button 
                  onClick={handleRefineDescription}
                  disabled={loadingAction === 'refine' || !config.description}
                  className="absolute top-2 right-2 p-1.5 bg-blue-600/20 hover:bg-blue-600/40 rounded-md text-blue-400 transition-colors"
                  title="Refine with AI"
                >
                  {loadingAction === 'refine' ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                </button>
              </div>
            </div>
          </section>

          <hr className="border-zinc-800" />

          {/* Style */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Wand2 size={14} /> Aesthetics
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style}
                  onClick={() => updateConfig('style', style)}
                  className={`text-xs px-2 py-2 rounded-md border text-left truncate transition-colors ${
                    config.style === style 
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200' 
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {style}
                </button>
              ))}
              <button
                onClick={() => setIsRefModalOpen(true)}
                className={`col-span-2 text-xs px-2 py-2 rounded-md border text-left flex items-center justify-center gap-2 transition-colors ${
                    config.style === 'Image Reference'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200' 
                    : 'border-dashed border-zinc-600 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {loadingAction === 'analyze-style' ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14} />}
                Upload Reference Image (Max 3)
              </button>
            </div>

            {config.style === 'Image Reference' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs text-zinc-500">Extracted Style Prompt</label>
                <textarea 
                  value={config.stylePrompt || ''}
                  onChange={(e) => updateConfig('stylePrompt', e.target.value)}
                  className="w-full bg-zinc-900 border border-purple-500/30 rounded-lg px-3 py-2 text-xs text-purple-100 focus:outline-none min-h-[80px]"
                  placeholder="AI will describe the uploaded image style here..."
                />
              </div>
            )}

            <div className="pt-2">
              <label className="text-xs text-zinc-500 mb-2 block">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map(ratio => (
                  <button
                      key={ratio.value}
                      onClick={() => updateConfig('aspectRatio', ratio.value)}
                      className={`p-2 rounded border flex items-center gap-1 transition-colors ${
                        config.aspectRatio === ratio.value
                        ? 'bg-zinc-100 text-black border-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                      title={ratio.label}
                  >
                    <Ratio size={14} />
                    <span className="text-xs font-medium">{ratio.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-zinc-800" />

          {/* Sections */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <LayoutTemplate size={14} /> Sections
              </h2>
              <button onClick={addSection} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
                  <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {config.sections.map((section, idx) => (
                <div key={section.id} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3 group hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <input 
                        className="bg-transparent border-none p-0 text-sm font-medium text-white focus:ring-0 placeholder-zinc-600 w-32" 
                        placeholder="Section Name"
                        value={section.name}
                        onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={1} max={10}
                          value={section.imageCount}
                          onChange={(e) => updateSection(section.id, 'imageCount', parseInt(e.target.value))}
                          className="w-8 bg-zinc-900 border border-zinc-700 rounded text-center text-xs py-1"
                          title="Image Count"
                        />
                        <button onClick={() => removeSection(section.id)} className="text-zinc-600 hover:text-red-400">
                            <Trash2 size={14} />
                        </button>
                      </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={section.description || ''}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Specific details..."
                      className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded px-2 py-1.5 text-xs text-zinc-400 focus:outline-none resize-none h-16 pr-6"
                    />
                    <button 
                        onClick={() => handleAutoFillSection(section.id, section.name)}
                        disabled={loadingAction === `autofill-${section.id}`}
                        className="absolute top-1 right-1 text-zinc-600 hover:text-blue-400 p-1"
                        title="Auto-fill details"
                    >
                      {loadingAction === `autofill-${section.id}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-12"></div> {/* Spacer */}
        </div>

        <div className="p-5 border-t border-zinc-800 bg-zinc-900 sticky bottom-0 z-10">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !config.name}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />}
            {isGenerating ? 'Generating...' : 'Generate Assets'}
          </button>
        </div>
      </aside>

      <ReferenceImageModal 
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
        onAnalyze={handleAnalyzeReference}
        isAnalyzing={loadingAction === 'analyze-style'}
      />
    </>
  );
};