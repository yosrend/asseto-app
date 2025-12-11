import React, { useState } from 'react';
import { ProjectConfig, SectionConfig } from '../types';
import { STYLE_PRESETS, CATEGORY_PRESETS, DEFAULT_SECTIONS, ASPECT_RATIOS } from '../constants';
import { Plus, Trash2, Wand2, ArrowRight, LayoutTemplate, Ratio } from 'lucide-react';

interface WizardProps {
  onComplete: (config: ProjectConfig) => void;
}

export const Wizard: React.FC<WizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState(STYLE_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  
  const [sections, setSections] = useState<SectionConfig[]>(
    DEFAULT_SECTIONS.map(s => ({ ...s, id: crypto.randomUUID() }))
  );

  const addSection = () => {
    setSections([...sections, { 
      id: crypto.randomUUID(), 
      name: 'New Section', 
      description: '', 
      imageCount: 1 
    }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: keyof SectionConfig, value: string | number) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubmit = () => {
    onComplete({
      name,
      category,
      description,
      style,
      aspectRatio,
      sections
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          New Project
        </h1>
        <p className="text-zinc-400">Configure your asset generation pipeline</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        {/* Step Indicator */}
        <div className="flex items-center mb-8 text-sm">
          <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>1. Context</div>
          <div className="w-8 h-px bg-zinc-800 mx-2"></div>
          <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>2. Style</div>
          <div className="w-8 h-px bg-zinc-800 mx-2"></div>
          <div className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>3. Sections</div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Project Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., FinNova App Redesign"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Website Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {CATEGORY_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the look and feel, target audience, and main goals..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-32"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(2)}
                disabled={!name || !description}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Style & Size */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-4">Choose Aesthetic</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      style === s 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center mb-3">
                      <Wand2 size={16} className={style === s ? 'text-blue-400' : 'text-zinc-500'} />
                    </div>
                    <span className="text-sm font-medium">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6">
              <label className="block text-sm font-medium text-zinc-300 mb-4">Image Dimensions (Aspect Ratio)</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                 {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${
                        aspectRatio === ratio.value
                          ? 'bg-zinc-800 border-blue-500 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <Ratio size={20} className={aspectRatio === ratio.value ? 'text-blue-500' : 'text-zinc-600'} />
                      <span className="text-xs">{ratio.label}</span>
                    </button>
                 ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Sections */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-zinc-300">Project Sections</label>
                <button onClick={addSection} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                  <Plus size={14} /> Add Section
                </button>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sections.map((section, idx) => (
                  <div key={section.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex gap-4 items-start group">
                    <div className="mt-3 text-zinc-500">
                      <LayoutTemplate size={18} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={section.name}
                          onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                          placeholder="Section Name"
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded px-2">
                          <span className="text-xs text-zinc-500">Count</span>
                          <input 
                            type="number" 
                            min="1" 
                            max="10"
                            value={section.imageCount}
                            onChange={(e) => updateSection(section.id, 'imageCount', parseInt(e.target.value))}
                            className="w-12 bg-transparent text-center text-sm py-2 focus:outline-none"
                          />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={section.description || ''}
                        onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                        placeholder="Specific details for this section (optional)"
                        className="w-full bg-zinc-900 border border-zinc-700/50 rounded px-3 py-2 text-xs text-zinc-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => removeSection(section.id)}
                      className="mt-3 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
             </div>

             <div className="flex justify-between pt-4 border-t border-zinc-800">
              <button 
                onClick={() => setStep(2)}
                className="text-zinc-400 hover:text-white px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
              >
                Generate Assets <Wand2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};