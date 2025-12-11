import React, { useState } from 'react';
import { ProjectConfig, GeneratedImage, ImageStatus } from '../types';
import { Download, Copy, Check, RefreshCw, Maximize2, X, ChevronDown, Sparkles, Sun, Moon, Grid } from 'lucide-react';
import JSZip from 'jszip';

interface GalleryProps {
  config: ProjectConfig;
  images: GeneratedImage[];
  onRegenerate: (image: GeneratedImage) => Promise<void>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ config, images, onRegenerate, theme, onToggleTheme }) => {
  const [downloadAllDropdownOpen, setDownloadAllDropdownOpen] = useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<string | null>(null); // sectionId
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());

  // --- Helpers ---
  const sanitize = (str: string) => str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');

  const getFileName = (sectionName: string, index: number) => {
    return `${sanitize(config.name)}_${sanitize(sectionName)}_${index + 1}`;
  };

  // --- Actions ---

  const handleCopy = async (dataUrl: string, id: string) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const convertAndDownload = async (dataUrl: string, filename: string, format: 'png' | 'jpeg' | 'webp') => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if(ctx) {
        ctx.drawImage(img, 0, 0);
        const mimeType = `image/${format}`;
        const finalUrl = canvas.toDataURL(mimeType, 0.9);
        const link = document.createElement('a');
        link.href = finalUrl;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  };

  const handleDownloadAll = async (format: 'png' | 'jpeg' | 'webp' = 'png') => {
    setIsZipping(true);
    setDownloadAllDropdownOpen(false);
    const zip = new JSZip();
    
    // Group by section
    const completedImages = images.filter(i => i.status === ImageStatus.COMPLETED && i.dataUrl);
    
    // Keep track of index per section for naming
    const sectionCounters: Record<string, number> = {};

    for (let i = 0; i < completedImages.length; i++) {
       const img = completedImages[i];
       const section = config.sections.find(s => s.id === img.sectionId);
       
       if (section && img.dataUrl) {
          const sectionName = section.name;
          const sanitizedSectionName = sanitize(sectionName);
          const folder = zip.folder(sanitizedSectionName);
          
          if (!sectionCounters[section.id]) sectionCounters[section.id] = 0;
          const currentIndex = sectionCounters[section.id]++;
          
          const filename = getFileName(sectionName, currentIndex);

          if (format === 'png') {
            const data = img.dataUrl.split(',')[1];
            folder?.file(`${filename}.png`, data, { base64: true });
          } else {
             await new Promise<void>((resolve) => {
                const imageObj = new Image();
                imageObj.src = img.dataUrl!;
                imageObj.onload = () => {
                   const canvas = document.createElement('canvas');
                   canvas.width = imageObj.width;
                   canvas.height = imageObj.height;
                   const ctx = canvas.getContext('2d');
                   if(ctx) {
                      ctx.drawImage(imageObj, 0, 0);
                      const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
                      const data = dataUrl.split(',')[1];
                      folder?.file(`${filename}.${format}`, data, { base64: true });
                   }
                   resolve();
                };
             });
          }
       }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitize(config.name)}_assets.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSection = async (sectionId: string, format: 'png' | 'jpeg' | 'webp') => {
     const sectionImages = images.filter(i => i.sectionId === sectionId && i.status === ImageStatus.COMPLETED && i.dataUrl);
     const section = config.sections.find(s => s.id === sectionId);
     if (!section || sectionImages.length === 0) return;

     setIsZipping(true);
     const zip = new JSZip();
     
     for (let i = 0; i < sectionImages.length; i++) {
        const img = sectionImages[i];
        const filename = getFileName(section.name, i);

        if (img.dataUrl) {
           if (format === 'png') {
              const data = img.dataUrl.split(',')[1];
              zip.file(`${filename}.png`, data, { base64: true });
           } else {
               await new Promise<void>((resolve) => {
                const imageObj = new Image();
                imageObj.src = img.dataUrl!;
                imageObj.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = imageObj.width;
                    canvas.height = imageObj.height;
                    const ctx = canvas.getContext('2d');
                    if(ctx) {
                      ctx.drawImage(imageObj, 0, 0);
                      const dataUrl = canvas.toDataURL(`image/${format}`, 0.9);
                      const data = dataUrl.split(',')[1];
                      zip.file(`${filename}.${format}`, data, { base64: true });
                    }
                    resolve();
                };
              });
           }
        }
     }

     const content = await zip.generateAsync({ type: "blob" });
     const url = URL.createObjectURL(content);
     const link = document.createElement('a');
     link.href = url;
     link.download = `${sanitize(section.name)}_${format}.zip`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     setIsZipping(false);
     setDownloadDropdownOpen(null);
  };

  const toggleRegenerate = async (img: GeneratedImage) => {
    setRegeneratingIds(prev => new Set(prev).add(img.id));
    await onRegenerate(img);
    setRegeneratingIds(prev => {
      const next = new Set(prev);
      next.delete(img.id);
      return next;
    });
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-zinc-50 dark:bg-[#09090b] p-8 transition-colors duration-500 custom-scrollbar">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-10 sticky top-0 bg-zinc-50/80 dark:bg-[#09090b]/80 backdrop-blur-md py-4 z-20 transition-colors">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-900 dark:text-white transition-colors">{config.name || "Untitled Project"}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {images.length} Assets in Pipeline
          </p>
        </div>
        <div className="flex gap-4 relative items-center">
          <button 
            onClick={onToggleTheme}
            className="p-2.5 rounded-full bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {images.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setDownloadAllDropdownOpen(!downloadAllDropdownOpen)}
                disabled={isZipping}
                className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                {isZipping ? <RefreshCw className="animate-spin" size={18}/> : <Download size={18} />}
                Download All
                <ChevronDown size={14} className={`transition-transform duration-200 ${downloadAllDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {downloadAllDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-50 dark:bg-white/5">Select Format</div>
                  {['png', 'jpeg', 'webp'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleDownloadAll(fmt as any)}
                      className="w-full text-left px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 capitalize font-medium transition-colors border-b border-zinc-100 dark:border-white/5 last:border-0"
                    >
                      Package as .{fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sections Vertical Feed */}
      <div className="space-y-16 pb-32">
        {config.sections.map((section, sectionIdx) => {
           const sectionImages = images.filter(img => img.sectionId === section.id);
           if (sectionImages.length === 0) return null;

           return (
             <div key={section.id} className="animate-fade-in-up" style={{ animationDelay: `${sectionIdx * 100}ms` }}>
                <div className="flex justify-between items-end mb-6 pb-4 border-b border-zinc-200 dark:border-white/5">
                   <div>
                      <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white flex items-center gap-3">
                        {section.name}
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {sectionImages.length} items
                        </span>
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 max-w-2xl font-light">{section.description}</p>
                   </div>
                   
                   {/* Section Download Dropdown */}
                   <div className="relative">
                      <button 
                        onClick={() => setDownloadDropdownOpen(downloadDropdownOpen === section.id ? null : section.id)}
                        className="text-xs font-medium flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-2 rounded-lg transition-all hover:border-zinc-300 dark:hover:border-white/20"
                      >
                         Download Section <ChevronDown size={14} />
                      </button>
                      {downloadDropdownOpen === section.id && (
                        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95">
                           <div className="px-3 py-2 text-[10px] text-zinc-400 font-bold uppercase bg-zinc-50 dark:bg-white/5">Format</div>
                           {['png', 'jpeg', 'webp'].map((fmt) => (
                             <button
                               key={fmt}
                               onClick={() => handleDownloadSection(section.id, fmt as any)}
                               className="w-full text-left px-4 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 capitalize"
                             >
                               .{fmt}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {sectionImages.map((img, idx) => (
                      <div 
                        key={img.id} 
                        className={`relative group rounded-2xl overflow-hidden border transition-all duration-500 hover:-translate-y-1 ${
                           img.status === ImageStatus.PENDING 
                             ? 'border-indigo-500/20 bg-zinc-100 dark:bg-white/5 shadow-inner' 
                             : 'border-zinc-200 dark:border-white/5 bg-white dark:bg-[#18181b] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10'
                        }`}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                      >
                         <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-white/5">
                            {img.status === ImageStatus.PENDING || regeneratingIds.has(img.id) ? (
                               <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 p-6 text-center">
                                  <div className="relative mb-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                       <Sparkles size={12} className="text-indigo-400 animate-pulse" />
                                    </div>
                                  </div>
                                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase animate-pulse">
                                     {regeneratingIds.has(img.id) ? 'Refining Asset...' : 'Generating...'}
                                  </span>
                                  {/* Blurred background if regenerating */}
                                  {img.dataUrl && (
                                     <img src={img.dataUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110 -z-10 transition-opacity" />
                                  )}
                               </div>
                            ) : img.status === ImageStatus.FAILED ? (
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400">
                                  <X size={24} className="mb-2 opacity-50" />
                                  <span className="text-xs font-medium">Generation Failed</span>
                               </div>
                            ) : (
                               <>
                                 <img 
                                   src={img.dataUrl} 
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                                   onClick={() => setSelectedImage(img)}
                                 />
                                 
                                 {/* Overlay Actions */}
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                     <button 
                                       onClick={() => handleCopy(img.dataUrl!, img.id)}
                                       className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                       title="Copy to Clipboard"
                                     >
                                        {copiedId === img.id ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                                     </button>
                                     <button 
                                       onClick={() => toggleRegenerate(img)}
                                       className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                       title="Regenerate"
                                     >
                                        <RefreshCw size={18} />
                                     </button>
                                     <button 
                                       onClick={() => setSelectedImage(img)}
                                       className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white transition-all hover:scale-110 active:scale-95"
                                       title="View Fullscreen"
                                     >
                                        <Maximize2 size={18} />
                                     </button>
                                     
                                     <div className="relative group/dl">
                                        <button className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95">
                                           <Download size={18} />
                                        </button>
                                        {/* Hover Dropdown for single image */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden hidden group-hover/dl:block z-30 animate-in fade-in slide-in-from-bottom-2">
                                          {['png', 'jpeg', 'webp'].map((fmt) => (
                                            <button
                                              key={fmt}
                                              onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const filename = getFileName(section.name, idx);
                                                convertAndDownload(img.dataUrl!, filename, fmt as any); 
                                              }}
                                              className="w-full text-left px-4 py-2.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 capitalize block font-medium"
                                            >
                                              {fmt}
                                            </button>
                                          ))}
                                        </div>
                                     </div>
                                 </div>
                               </>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           );
        })}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage.dataUrl} 
            className="max-h-full max-w-full rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};