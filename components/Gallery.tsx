
import React, { useState } from 'react';
import { ProjectConfig, GeneratedImage, ImageStatus } from '../types';
import { Download, Copy, Check, RefreshCw, Maximize2, X, ChevronDown, Sparkles } from 'lucide-react';
import JSZip from 'jszip';

interface GalleryProps {
  config: ProjectConfig;
  images: GeneratedImage[];
  onRegenerate: (image: GeneratedImage) => Promise<void>;
}

export const Gallery: React.FC<GalleryProps> = ({ config, images, onRegenerate }) => {
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [downloadDropdownOpen, setDownloadDropdownOpen] = useState<string | null>(null); // 'all' or sectionId
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());

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

  const handleDownloadAll = async () => {
    setIsZipping(true);
    const zip = new JSZip();
    
    // Group by section
    const completedImages = images.filter(i => i.status === ImageStatus.COMPLETED && i.dataUrl);
    
    completedImages.forEach((img, idx) => {
       const section = config.sections.find(s => s.id === img.sectionId);
       const folderName = section ? section.name.replace(/\s+/g, '_') : 'Uncategorized';
       const folder = zip.folder(folderName);
       if (img.dataUrl) {
         const data = img.dataUrl.split(',')[1];
         folder?.file(`${folderName}_${idx + 1}.png`, data, { base64: true });
       }
    });

    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.name.replace(/\s+/g, '_')}_assets.zip`;
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
     
     // Need to convert if not PNG, but for zip bulk, usually keep original PNG from API is safer/faster. 
     // For this MVP, we will zip the original PNGs to avoid massive canvas processing overhead on the client.
     
     sectionImages.forEach((img, idx) => {
        if (img.dataUrl) {
           const data = img.dataUrl.split(',')[1];
           zip.file(`${section.name.replace(/\s+/g, '_')}_${idx + 1}.png`, data, { base64: true });
        }
     });

     const content = await zip.generateAsync({ type: "blob" });
     const url = URL.createObjectURL(content);
     const link = document.createElement('a');
     link.href = url;
     link.download = `${section.name}_${format}.zip`; // Naming convention
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
    <div className="flex-1 h-screen overflow-y-auto bg-zinc-950 p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-zinc-950/80 backdrop-blur-md py-4 z-10 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white">{config.name || "Untitled Project"}</h1>
          <p className="text-zinc-500 text-sm">
            {images.length} Assets • {images.filter(i => i.status === ImageStatus.COMPLETED).length} Generated
          </p>
        </div>
        <div className="flex gap-3">
          {images.length > 0 && (
             <button 
               onClick={handleDownloadAll}
               disabled={isZipping}
               className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow"
             >
                {isZipping ? <RefreshCw className="animate-spin" size={16}/> : <Download size={16} />}
                Download All (.zip)
             </button>
          )}
        </div>
      </div>

      {/* Sections Vertical Feed */}
      <div className="space-y-12 pb-24">
        {config.sections.map((section) => {
           const sectionImages = images.filter(img => img.sectionId === section.id);
           if (sectionImages.length === 0) return null;

           return (
             <div key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end mb-4">
                   <div>
                      <h2 className="text-xl font-semibold text-zinc-200 flex items-center gap-2">
                        {section.name}
                        <span className="text-xs font-normal text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                          {sectionImages.length}
                        </span>
                      </h2>
                      <p className="text-sm text-zinc-500 max-w-2xl">{section.description}</p>
                   </div>
                   
                   {/* Section Download Dropdown */}
                   <div className="relative">
                      <button 
                        onClick={() => setDownloadDropdownOpen(downloadDropdownOpen === section.id ? null : section.id)}
                        className="text-xs flex items-center gap-1 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md"
                      >
                         Download Section <ChevronDown size={12} />
                      </button>
                      {downloadDropdownOpen === section.id && (
                        <div className="absolute right-0 top-full mt-2 w-32 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-20">
                           <div className="px-3 py-2 text-xs text-zinc-500 font-semibold bg-zinc-950">Format</div>
                           {['png', 'jpeg', 'webp'].map((fmt) => (
                             <button
                               key={fmt}
                               onClick={() => handleDownloadSection(section.id, fmt as any)}
                               className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-blue-600 hover:text-white capitalize"
                             >
                               .{fmt}
                             </button>
                           ))}
                        </div>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {sectionImages.map((img) => (
                      <div 
                        key={img.id} 
                        className={`relative group rounded-xl overflow-hidden border transition-all duration-300 ${
                           img.status === ImageStatus.PENDING 
                             ? 'border-blue-500/30 bg-zinc-900' 
                             : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:shadow-lg'
                        }`}
                      >
                         <div className="aspect-video relative overflow-hidden">
                            {img.status === ImageStatus.PENDING || regeneratingIds.has(img.id) ? (
                               <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10">
                                  <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-blue-500 animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                       <Sparkles size={16} className="text-blue-500 animate-pulse" />
                                    </div>
                                  </div>
                                  <span className="text-xs text-blue-400 mt-3 font-medium animate-pulse">
                                     {regeneratingIds.has(img.id) ? 'Refining...' : 'Dreaming...'}
                                  </span>
                                  {/* Blurred background if regenerating */}
                                  {img.dataUrl && (
                                     <img src={img.dataUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-lg -z-10" />
                                  )}
                               </div>
                            ) : img.status === ImageStatus.FAILED ? (
                               <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
                                  <span className="text-xs">Generation Failed</span>
                               </div>
                            ) : (
                               <>
                                 <img 
                                   src={img.dataUrl} 
                                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                                   onClick={() => setSelectedImage(img)}
                                 />
                                 
                                 {/* Overlay Actions */}
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                     <button 
                                       onClick={() => handleCopy(img.dataUrl!, img.id)}
                                       className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full text-white transition-transform hover:scale-110"
                                       title="Copy to Clipboard"
                                     >
                                        {copiedId === img.id ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                                     </button>
                                     <button 
                                       onClick={() => toggleRegenerate(img)}
                                       className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full text-white transition-transform hover:scale-110"
                                       title="Regenerate"
                                     >
                                        <RefreshCw size={18} />
                                     </button>
                                     <button 
                                       onClick={() => setSelectedImage(img)}
                                       className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur rounded-full text-white transition-transform hover:scale-110"
                                       title="View"
                                     >
                                        <Maximize2 size={18} />
                                     </button>
                                     <div className="relative group/dl">
                                        <button className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white shadow-lg transition-transform hover:scale-110">
                                           <Download size={18} />
                                        </button>
                                        {/* Hover Dropdown for single image */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-24 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden hidden group-hover/dl:block z-30">
                                          {['png', 'jpeg', 'webp'].map((fmt) => (
                                            <button
                                              key={fmt}
                                              onClick={(e) => { e.stopPropagation(); convertAndDownload(img.dataUrl!, `asset_${img.id}`, fmt as any); }}
                                              className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-blue-600 hover:text-white capitalize block"
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
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-zinc-400 hover:text-white"
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage.dataUrl} 
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
};
