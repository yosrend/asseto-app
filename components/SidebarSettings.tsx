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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#121215] dark:bg-[#121215] bg-white border border-white/10 dark:border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-display font-bold text-white mb-2 flex items-center gap-2">
          <ImagePlus size={24} className="text-indigo-500"/> Reference Style
        </h2>
        <p className="text-sm text-zinc-400 mb-8 font-light">
          Upload up to 3 images. Our AI will analyze their lighting, palette, and vibe.
        </p>

        {/* Drop/Preview Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-8 mb-6 flex flex-col items-center justify-center transition-all duration-300 ${
            images.length < 3 
              ? 'border-zinc-700 hover:border-indigo-500/50 hover:bg-white/5 cursor-pointer' 
              : 'border-zinc-800 bg-black/20 cursor-default'
          }`}
          onClick={() => images.length < 3 && fileInputRef.current?.click()}
        >
          {images.length === 0 ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                 <Upload size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-zinc-300 font-medium">Click to upload or <span className="text-indigo-400">Ctrl+V</span></p>
                <p className="text-xs text-zinc-500">PNG, JPG, WEBP</p>
              </div>
            </div>
          ) : (
             <div className="grid grid-cols-3 gap-4 w-full" onClick={(e) => e.stopPropagation()}>
               {images.map((img, idx) => (
                 <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <img src={img} alt="Reference" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <X size={12} />
                    </button>
                 </div>
               ))}
               {images.length < 3 && (
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-white/5 cursor-pointer transition-all"
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
           <span className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{images.length}/3 IMAGES</span>
           <div className="flex gap-3">
             <button 
               onClick={onClose}
               className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={() => onAnalyze(images)}
               disabled={images.length === 0 || isAnalyzing}
               className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50"
             >
               {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
               Extract Style
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
      
      const newConfig = {
        ...config,
        style: 'Image Reference',
        stylePrompt: stylePrompt
      };
      onChange(newConfig);

      setIsRefModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <aside className="w-[420px] bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-white/5 h-screen overflow-y-auto flex flex-col shadow-2xl z-20 transition-colors duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={16} className="text-white fill-white/20" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">Asseto.</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide ml-11">AI DESIGN ASSET GENERATOR</p>
        </div>

        <div className="p-6 space-y-10 flex-1">
          
          {/* Project Context */}
          <section className="space-y-5">
            <h2 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Type size={12} /> Context
            </h2>
            
            <div className="space-y-4">
              <div className="group">
                <input 
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  placeholder="Project Name"
                  className="w-full bg-transparent border-b border-zinc-300 dark:border-white/10 px-1 py-2 text-lg font-medium text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors"
                />
              </div>

              <div className="relative group">
                <select 
                  value={config.category === 'Custom' ? 'Custom' : config.category}
                  onChange={(e) => updateConfig('category', e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none appearance-none transition-colors cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10"
                >
                  {CATEGORY_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Custom">Custom Category...</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <LayoutTemplate size={14} />
                </div>
              </div>
              
              {(config.category === 'Custom' || config.customCategory) && (
                <input 
                  type="text"
                  value={config.customCategory || ''}
                  onChange={(e) => {
                      updateConfig('category', 'Custom');
                      updateConfig('customCategory', e.target.value);
                  }}
                  placeholder="Enter custom category..."
                  className="w-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-indigo-900 dark:text-indigo-200 placeholder-indigo-400/50 focus:outline-none focus:border-indigo-500 transition-all animate-in fade-in slide-in-from-top-2"
                />
              )}

              <div className="relative group">
                <textarea 
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  placeholder="Describe your visual direction..."
                  className="w-full bg-zinc-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[120px] resize-none pr-10 transition-colors hover:bg-zinc-200 dark:hover:bg-white/10"
                />
                <button 
                  onClick={handleRefineDescription}
                  disabled={loadingAction === 'refine' || !config.description}
                  className="absolute top-3 right-3 p-1.5 bg-white/50 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors backdrop-blur-sm"
                  title="Refine with AI"
                >
                  {loadingAction === 'refine' ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                </button>
              </div>
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-white/5" />

          {/* Style */}
          <section className="space-y-5">
            <h2 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Wand2 size={12} /> Aesthetic
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style}
                  onClick={() => updateConfig('style', style)}
                  className={`text-xs px-3 py-2.5 rounded-lg border text-left truncate transition-all duration-200 ${
                    config.style === style 
                    ? 'bg-indigo-50 dark:bg-indigo-600 border-indigo-200 dark:border-indigo-500 text-indigo-900 dark:text-white font-medium shadow-sm' 
                    : 'border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/10'
                  }`}
                >
                  {style}
                </button>
              ))}
              <button
                onClick={() => setIsRefModalOpen(true)}
                className={`col-span-2 text-xs px-3 py-3 rounded-lg border border-dashed flex items-center justify-center gap-2 transition-all duration-200 ${
                    config.style === 'Image Reference'
                    ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-200 font-medium' 
                    : 'border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-500 dark:text-zinc-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'
                }`}
              >
                {loadingAction === 'analyze-style' ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14} />}
                {config.style === 'Image Reference' ? 'Update Reference Images' : 'Upload Reference Image'}
              </button>
            </div>

            {config.style === 'Image Reference' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wide">
                     <Sparkles size={10} /> AI Style Analysis
                  </div>
                  <textarea 
                    value={config.stylePrompt || ''}
                    onChange={(e) => updateConfig('stylePrompt', e.target.value)}
                    className="w-full bg-transparent border-none p-0 text-xs text-purple-900 dark:text-purple-100 focus:outline-none min-h-[60px] resize-none leading-relaxed placeholder-purple-300"
                    placeholder="AI analysis..."
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="text-xs text-zinc-500 dark:text-zinc-500 font-medium mb-3 block uppercase tracking-wider">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map(ratio => (
                  <button
                      key={ratio.value}
                      onClick={() => updateConfig('aspectRatio', ratio.value)}
                      className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                        config.aspectRatio === ratio.value
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-sm font-medium'
                        : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-200 dark:hover:bg-white/10'
                      }`}
                      title={ratio.label}
                  >
                    <Ratio size={12} />
                    <span className="text-xs">{ratio.value === 'Custom' ? 'Custom' : ratio.value}</span>
                  </button>
                ))}
              </div>

              {/* Custom Dimensions Inputs */}
              {config.aspectRatio === 'Custom' && (
                <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-1 bg-zinc-100 dark:bg-white/5 p-2 rounded-lg border border-zinc-200 dark:border-white/5">
                   <div className="flex-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold pl-1 mb-1 block">Width</label>
                      <input 
                         type="number"
                         value={config.width || 1024}
                         onChange={(e) => updateConfig('width', parseInt(e.target.value))}
                         className="w-full bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-white font-mono"
                         placeholder="1024"
                      />
                   </div>
                   <div className="flex items-end pb-2 text-zinc-400">x</div>
                   <div className="flex-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold pl-1 mb-1 block">Height</label>
                      <input 
                         type="number"
                         value={config.height || 1024}
                         onChange={(e) => updateConfig('height', parseInt(e.target.value))}
                         className="w-full bg-white dark:bg-black/30 border border-zinc-200 dark:border-white/10 rounded px-2 py-1.5 text-xs text-zinc-900 dark:text-white font-mono"
                         placeholder="1024"
                      />
                   </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-zinc-200 dark:border-white/5" />

          {/* Sections */}
          <section className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <LayoutTemplate size={12} /> Sections
              </h2>
              <button onClick={addSection} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              {config.sections.map((section, idx) => (
                <div key={section.id} className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl p-4 group hover:border-zinc-300 dark:hover:border-white/10 transition-colors duration-300">
                  <div className="flex justify-between items-start mb-3">
                      <input 
                        className="bg-transparent border-none p-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-0 placeholder-zinc-400 dark:placeholder-zinc-600 w-40" 
                        placeholder="Section Name"
                        value={section.name}
                        onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                      />
                      <button onClick={() => removeSection(section.id)} className="text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                      </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] text-zinc-500 uppercase font-semibold">Quantity: {section.imageCount}</label>
                    </div>
                    <input 
                       type="range"
                       min="1"
                       max="10"
                       step="1"
                       value={section.imageCount}
                       onChange={(e) => updateSection(section.id, 'imageCount', parseInt(e.target.value))}
                       className="w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="relative">
                    <textarea 
                      value={section.description || ''}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Details e.g. 'Hero image with abstract 3D shape'"
                      className="w-full bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none h-16 pr-8 transition-colors"
                    />
                    <button 
                        onClick={() => handleAutoFillSection(section.id, section.name)}
                        disabled={loadingAction === `autofill-${section.id}`}
                        className="absolute top-2 right-2 text-zinc-400 dark:text-zinc-600 hover:text-indigo-500 dark:hover:text-indigo-400 p-1 transition-colors"
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

        {/* Footer Action */}
        <div className="p-6 border-t border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0c0c0e]/95 backdrop-blur sticky bottom-0 z-10 transition-colors duration-300">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !config.name}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 transition-all active:scale-[0.98] tracking-wide"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />}
            {isGenerating ? 'GENERATING ASSETS...' : 'GENERATE ASSETS'}
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