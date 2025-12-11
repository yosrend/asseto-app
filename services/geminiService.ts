import { GoogleGenAI } from "@google/genai";
import { ProjectConfig, SectionConfig, GeneratedImage, ImageStatus } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helper: Construct the main image prompt ---
const constructPrompt = (project: ProjectConfig, sectionName: string, sectionDesc: string) => {
  let styleInstruction = project.style;
  
  // If we have a custom extracted style prompt, prioritize it
  if (project.style === 'Image Reference' && project.stylePrompt) {
    styleInstruction = `Match this specific visual style: ${project.stylePrompt}`;
  }

  const category = project.customCategory || project.category;

  return `
    Create a professional image for a "${category}" website.
    Aesthetic/Style: ${styleInstruction}.
    
    Context: This image is for the "${sectionName}" section.
    Section Details: ${sectionDesc || "Standard web section layout"}.
    Project Description: ${project.description}.
    
    Requirements:
    - High quality, suitable for web design assets.
    - No text overlays or interface elements, just the visual asset.
    - Clean, modern, and professional.
  `.trim();
};

// --- Core: Generate Image ---
export const generateImageForSection = async (
  project: ProjectConfig,
  section: SectionConfig,
  placeholderId: string
): Promise<GeneratedImage> => {
  
  const prompt = constructPrompt(project, section.name, section.description || "");

  // Determine Aspect Ratio
  let targetAspectRatio = project.aspectRatio;
  if (project.aspectRatio === 'Custom' && project.width && project.height) {
    // Gemini supports simple ratios like "width:height" string
    targetAspectRatio = `${project.width}:${project.height}`;
  } else if (project.aspectRatio === 'Custom') {
    // Fallback if width/height missing
    targetAspectRatio = '16:9';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio,
        }
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          
          return {
            id: placeholderId,
            sectionId: section.id,
            dataUrl: dataUrl,
            prompt: prompt,
            createdAt: Date.now(),
            status: ImageStatus.COMPLETED
          };
        }
      }
    }
    throw new Error("No image data returned");

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      id: placeholderId,
      sectionId: section.id,
      prompt: prompt,
      createdAt: Date.now(),
      status: ImageStatus.FAILED
    };
  }
};

// --- Feature: Refine Description ---
export const refineDescription = async (text: string): Promise<string> => {
  if (!text) return "";
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Refine the following website description to be more professional, descriptive, and visually evocative for an AI image generator. Keep it under 50 words. Input: "${text}"`
  });
  return response.text || text;
};

// --- Feature: Auto-fill Section Detail ---
export const generateSectionDetails = async (sectionName: string, projectContext: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a concise visual description (1 sentence) for a "${sectionName}" section of a "${projectContext}" website. Focus on what objects, people, or composition should be visible.`
  });
  return response.text || "";
};

// --- Feature: Extract Style from Reference Images ---
export const extractStyleFromImages = async (base64Images: string[]): Promise<string> => {
  if (base64Images.length === 0) return "";

  // Explicitly type the array to allow both inlineData and text parts
  const parts: { inlineData?: { mimeType: string; data: string }; text?: string }[] = base64Images.map(img => {
    // Extract real mime type if present, otherwise default to png
    const mimeMatch = img.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    const cleanBase64 = img.replace(/^data:([^;]+);base64,/, '');

    return {
      inlineData: {
        mimeType: mimeType, 
        data: cleanBase64
      }
    };
  });

  // Append instruction
  parts.push({ 
    text: "Analyze the visual style of these reference images. Describe the common lighting, color palette, texture, composition, and artistic technique in 2-3 concise sentences so another AI can replicate this specific style. Do not describe the subject matter, only the style." 
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using flash for multimodal input analysis
    contents: { parts }
  });
  return response.text || "";
};

// --- Feature: Regenerate ---
export const regenerateImage = async (
  project: ProjectConfig,
  originalImage: GeneratedImage
): Promise<GeneratedImage> => {
  
  // Recalculate aspect ratio based on current config (or store it in image, but using current config allows resizing)
  let targetAspectRatio = project.aspectRatio;
  if (project.aspectRatio === 'Custom' && project.width && project.height) {
    targetAspectRatio = `${project.width}:${project.height}`;
  } else if (project.aspectRatio === 'Custom') {
    targetAspectRatio = '16:9';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: originalImage.prompt } 
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio,
        }
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          
          return {
            ...originalImage,
            dataUrl: dataUrl,
            createdAt: Date.now(),
            status: ImageStatus.COMPLETED
          };
        }
      }
    }
    throw new Error("Failed to regenerate");
  } catch (error) {
    console.error("Regeneration Error:", error);
    return originalImage; 
  }
};