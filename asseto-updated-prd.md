# ASSETO - Updated Product Requirements Document
## Design Image Generator - Enhanced Version

**Product Name**: **ASSETO**  
**Version**: 2.0 (Updated with Advanced Features)  
**Date**: December 2025  
**Status**: Ready for Development  

---

## 1. Executive Summary

**ASSETO** adalah platform revolusioner untuk designer UI/UX membuat 10+ professional images per section dalam menit dengan AI. Dengan fitur advanced seperti image reference-based style transfer, AI-powered description refinement, dan auto-fill section details, ASSETO menghadirkan creative workflow yang super smart dan efficient.

### Value Proposition
- 🚀 **90% faster** asset discovery (5 hours → 5 minutes)
- 🎨 **Style consistency** across entire project dengan image reference
- 💡 **AI-powered refinement** untuk descriptions dan sections
- 📦 **One-click download** dengan multiple format support (.png, .jpg, .webp)
- 📋 **Unified interface** - Settings + Gallery dalam satu halaman
- 🖼️ **Real-time generation** - Blur preview + instant result display
- 📋 **Clipboard integration** - Copy any image instantly

---

## 2. New Architecture: Single-Page Layout

### 2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    ASSETO DASHBOARD                         │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│   LEFT SIDEBAR       │      CENTER + RIGHT AREA             │
│   (Settings Panel)   │   (Image Gallery Grid)               │
│                      │                                      │
│  1. Website Setup    │   [Section 1: Hero]                  │
│     - Category       │   ┌─────┬─────┬─────┐               │
│     - Custom Type    │   │Img1 │Img2 │Img3 │ [Download]    │
│     - Description    │   │[📋] │[📋] │[📋] │               │
│     - Refine (AI)    │   └─────┴─────┴─────┘               │
│                      │   [Download Section] [Download All]  │
│  2. Style Setup      │                                      │
│     - Style Type     │   [Section 2: Features]              │
│     - Image Ref      │   ┌─────┬─────┬─────┐               │
│     - Edit Prompt    │   │Img1 │Img2 │Img3 │ [Download]    │
│                      │   │[📋] │[📋] │[📋] │               │
│  3. Sections         │   └─────┴─────┴─────┘               │
│     - Auto Fill (AI) │   [Download Section] [Download All]  │
│     - Add/Remove     │                                      │
│                      │   [Section 3: About]                 │
│  4. Generation       │   ... (infinite scroll)              │
│     - Quality        │                                      │
│     - Quantity       │                                      │
│     - [Generate]     │                                      │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### 2.2 Sidebar Settings (Scrollable, One Page)

All settings in a single scrollable left sidebar:

**1. Website Details Section**
- Website Category (Dropdown + Custom Input)
- Category Custom Type (Text input for user-defined categories)
- Description (Textarea with AI "Refine" button)
- AI Refinement Modal

**2. Style Selection Section**
- Style Type (Dropdown: Realistic, Illustration, 3D, etc.)
- Image Reference Upload (1-3 images max)
- Auto-extract prompt from reference
- Editable prompt field

**3. Sections Management**
- Add Section button
- For each section:
  - Section name (Text input)
  - Auto-fill button (AI-powered)
  - Image count (1-10, slider)
  - Remove button
- Section reordering (drag-drop optional)

**4. Generation Settings**
- Image Quality (1K, 2K, 4K - dropdown)
- Aspect Ratio (16:9, 1:1, 9:16, etc.)
- Generate Button (Large, primary CTA)

### 2.3 Center/Right Area - Gallery Grid

- Responsive grid layout (3-4 columns desktop, 2 tablet, 1 mobile)
- Organized by section (section header + images below)
- Each image card shows:
  - Thumbnail image
  - Copy to clipboard button (📋)
  - Quick action buttons (preview, regenerate)
- Below each section:
  - [Download Section as ZIP]
  - [Download All Sections]
  - Format selector dropdown (PNG, JPG, WEBP)

---

## 3. Core Features (Updated)

### Feature 1: Project Setup (Single Page)

**Previous**: Multi-step wizard  
**New**: All settings in scrollable left sidebar

**User Flow**:
1. All fields visible in left panel
2. Fill website category (dropdown + custom)
3. Add description
4. Choose style (with image reference option)
5. Define sections
6. Click "Generate All"

**Components**:
```
Sidebar:
├── WebsiteSetup
│   ├── CategorySelector (with custom option)
│   ├── DescriptionInput
│   └── RefineButton (AI)
├── StyleSetup
│   ├── StyleTypeSelector
│   ├── ImageReferenceUpload
│   └── ExtractedPrompt
├── SectionManager
│   ├── SectionInput
│   ├── AutoFillButton (AI)
│   ├── ImageCountSlider
│   └── RemoveButton
└── GenerationSettings
    ├── QualitySelector
    ├── AspectRatioSelector
    └── GenerateButton
```

---

### Feature 2: Website Category - Custom Input

**Enhancement**: User-defined categories

**Implementation**:
```typescript
type CategoryOption = 
  | 'ecommerce'
  | 'saas'
  | 'blog'
  | 'portfolio'
  | 'agency'
  | 'custom'

// If user selects 'custom', show text input field
// Allow any category name: e.g., "Pet adoption platform"
```

**UI**:
- Dropdown with presets (ECommerce, SaaS, Blog, Portfolio, Agency)
- "Custom" option at bottom
- When "Custom" selected → Text input field appears
- Validation: min 3 chars, max 50 chars

---

### Feature 3: AI-Powered Description Refinement

**New Feature**: Refine descriptions with AI

**Flow**:
1. User enters description
2. Clicks "Refine with AI" button (sparkle icon ✨)
3. Modal opens with AI-enhanced version
4. User can accept or edit further
5. Enhanced description used in prompts

**Technical Implementation**:
```typescript
async function refineDescription(description: string): Promise<string> {
  const response = await genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  }).generateContent(`
    Enhance and refine this website description to be more 
    detailed and professional for AI image generation prompts:
    
    Original: "${description}"
    
    Provide a refined version that:
    - Is more descriptive
    - Includes style keywords
    - Is suitable for guiding image generation
    - Is maximum 2-3 sentences
  `);
  
  return extractTextFromResponse(response);
}
```

**Modal**:
- Title: "AI-Enhanced Description"
- Before/After comparison
- Accept button
- Edit button (to refine further)
- Cancel button

---

### Feature 4: Image Reference-Based Style Selection

**New Feature**: Upload 1-3 reference images for style

**Flow**:
1. User selects "Image Reference" as style type (radio button)
2. Drag-drop zone for 1-3 images
3. Auto-extract prompt from reference images using Gemini Vision
4. Show extracted prompt in editable field
5. User can refine/edit extracted prompt
6. Use this as "style master prompt"

**Implementation**:
```typescript
async function extractStylePromptFromImage(imageBase64: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-vision"
  });

  const response = await model.generateContent({
    contents: [{
      parts: [
        { text: `Analyze this reference image and extract a detailed style prompt for AI image generation. 
                 Focus on: composition, color palette, lighting, mood, artistic style, texture, subject matter.
                 Return a concise but detailed prompt suitable for guiding image generation.` },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
      ]
    }]
  });

  return extractTextFromResponse(response);
}
```

**UI Flow**:
```
Style Selection Dropdown
├── "Predefined Styles" group
│   ├── Realistic Photography
│   ├── Illustration
│   ├── 3D Rendering
│   └── ...
├── [Separator]
└── "Image Reference" (New)
    └── When selected:
        ├── Upload zone (1-3 images max)
        ├── Preview of uploaded images
        ├── Extracted Prompt field (editable)
        └── AI Refine button
```

**Extracted Prompt Example**:
```
"A professional photoshoot style with warm golden hour lighting, 
soft shadows, minimalist composition, modern aesthetic, clean 
product photography with shallow depth of field"
```

---

### Feature 5: AI Auto-Fill Section Details

**New Feature**: Auto-fill section-specific details

**Flow**:
1. User types section name (e.g., "Pricing")
2. Clicks "Auto-fill with AI" button (magic wand ✨)
3. AI generates context-specific details for that section
4. Shows in editable modal
5. User accepts or refines

**Implementation**:
```typescript
async function autoFillSectionDetails(
  sectionName: string,
  projectCategory: string,
  projectDescription: string
): Promise<{ prompt: string; guidance: string }> {
  const response = await genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  }).generateContent(`
    For a ${projectCategory} website (${projectDescription}),
    generate specific visual guidance for the "${sectionName}" section.
    
    Return JSON with:
    {
      "prompt": "detailed visual guidance for this section",
      "guidance": "tips on what kind of images work best here"
    }
    
    Example for "Pricing" section:
    {
      "prompt": "clean, professional pricing cards layout, 
                 comparison tables, premium feel, corporate aesthetic",
      "guidance": "Show pricing tiers visually, include icons 
                   for features, maintain consistency with brand"
    }
  `);

  return JSON.parse(extractTextFromResponse(response));
}
```

**Modal Design**:
- Title: "Auto-Fill Section Details"
- Show generated prompt
- Show guidance tips
- Editable text areas
- Accept / Edit / Cancel buttons

---

### Feature 6: Real-Time Generation with Blur Preview

**New Feature**: Show blurred preview while generating, display results as they complete

**Flow**:
1. User clicks "Generate All"
2. UI shows blur overlay on gallery area
3. Loading spinner appears
4. As each image generates:
   - Blur gradually resolves to real image
   - Image appears in grid immediately
   - No need to wait for all to complete
5. User can review section-by-section in real-time

**Technical Implementation**:
```typescript
// Progress streaming via API
async function generateImagesWithProgress(sections: Section[]) {
  for (const section of sections) {
    for (let i = 0; i < section.imageCount; i++) {
      // Use Server-Sent Events (SSE) for real-time updates
      const eventSource = new EventSource(
        `/api/projects/${projectId}/generate-stream`
      );

      eventSource.addEventListener('image-generated', (e) => {
        const image = JSON.parse(e.data);
        // Update gallery immediately
        updateGalleryWithImage(section.id, image);
      });

      eventSource.addEventListener('section-complete', (e) => {
        showSectionCompleteNotification(section.name);
      });
    }
  }
}
```

**UI Components**:
```
Gallery During Generation:
├── Blur overlay (opacity: 0.4)
├── Loading spinner center
├── Progress text: "Generating 15 images..."
├── Cancel button

As images arrive:
├── Blur fades out for each image
├── Image appears in grid
├── Counter updates: "Generated 5/15"
```

---

### Feature 7: Copy to Clipboard for Each Image

**New Feature**: 📋 button on each image card

**Implementation**:
```typescript
async function copyImageToClipboard(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    
    showToast('Image copied to clipboard!');
  } catch (error) {
    showToast('Failed to copy image', 'error');
  }
}
```

**UI**:
- 📋 icon button on hover/always visible
- Shows tooltip: "Copy to clipboard"
- Green checkmark feedback on click
- Toast notification: "Copied!"

---

### Feature 8: Download Format Options

**Enhancement**: Support multiple formats with dropdown

**Implementation**:
```typescript
type DownloadFormat = 'png' | 'jpg' | 'webp';

interface DownloadOption {
  label: string;
  format: DownloadFormat;
  quality: number; // for jpg/webp
}

const downloadOptions: DownloadOption[] = [
  { label: 'PNG (Lossless)', format: 'png', quality: 100 },
  { label: 'JPG (Compressed)', format: 'jpg', quality: 90 },
  { label: 'WebP (Modern)', format: 'webp', quality: 85 }
];
```

**UI**:
```
[▼ Download Format]  [Download Section]  [Download All]
  - PNG
  - JPG
  - WebP
```

---

### Feature 9: Enhanced Image Gallery

**Updates**:
- Each image card has:
  - Copy to clipboard button (📋)
  - Hover preview (enlarge on hover)
  - Quick regenerate button
  - More options menu
- Section headers with download options
- Download format selector

**Grid Structure**:
```
[Section Name: HERO] 
─────────────────────────────────────────
[Img1] [Img2] [Img3]         [v Download]
[📋]  [📋]  [📋]             [v Format]
[Img4] [Img5] [Img6]         
[📋]  [📋]  [📋]   

Download options:
[Download Section] [Download All]
```

---

## 4. Updated Database Schema

### New Tables/Fields

```prisma
// Reference Images for Style
model StyleReference {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  
  imageUrl  String
  extractedPrompt String
  customPrompt String?
  
  createdAt DateTime @default(now())
  
  @@index([projectId])
}

// Auto-filled Section Details
model SectionDetail {
  id        String   @id @default(cuid())
  sectionId String
  section   Section  @relation(fields: [sectionId], references: [id])
  
  aiGeneratedPrompt String?
  aiGuidance        String?
  userEditedPrompt  String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Refined Description
model RefinedDescription {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  
  original  String
  refined   String
  
  usedAt    DateTime?
  createdAt DateTime @default(now())
}
```

---

## 5. New API Endpoints

### Image Analysis & Refinement

```
POST   /api/descriptions/refine
// Input: description (string)
// Output: refined description (string)

POST   /api/styles/extract-from-image
// Input: image (base64 or URL)
// Output: extracted prompt (string)

POST   /api/sections/auto-fill
// Input: sectionName, projectCategory, projectDescription
// Output: { prompt, guidance } (JSON)

POST   /api/projects/[id]/generate-stream
// Output: SSE stream of { imageId, sectionId, imageUrl, status }

POST   /api/images/[id]/copy-to-clipboard
// Note: Actual copy happens on frontend
```

---

## 6. Updated User Flow

### Complete ASSETO Workflow

```
1. User lands on dashboard
   ↓
2. Left sidebar shows:
   - Website category (select or custom)
   - Website description + "Refine" button
   - Style selection (predefined or image reference)
   - If image reference: upload 1-3 images → extract prompt
   - Sections list (add/remove/auto-fill)
   - Quality + aspect ratio settings
   ↓
3. All settings visible on one page (no wizard)
   ↓
4. Click "Generate All"
   ↓
5. Right side shows:
   - Blur overlay appears
   - Loading spinner
   - As images generate: blur fades, images appear
   - Copy button (📋) on each image
   ↓
6. For each section:
   - View generated images
   - Click copy (📋) to copy to clipboard
   - Select download format
   - Download section as ZIP
   ↓
7. Option to:
   - Download all sections at once
   - Regenerate specific images
   - Refine description and regenerate
   - Upload new reference images
   ↓
8. All done! Ready to use in Figma
```

---

## 7. Technical Enhancements

### 7.1 Gemini Vision API Integration

**For image reference extraction**:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeImageForStyle(imageBase64: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-vision"
  });

  const response = await model.generateContent({
    contents: [{
      parts: [
        {
          text: `Analyze this image and create a detailed style prompt for AI image generation.
          Focus on: lighting, color palette, composition, mood, artistic style, texture, perspective.
          Return only the prompt, no explanations.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        }
      ]
    }]
  });

  return response.text();
}
```

### 7.2 Server-Sent Events for Real-Time Updates

```typescript
// app/api/projects/[id]/generate-stream/route.ts
export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // For each image to generate
      for (const section of sections) {
        for (let i = 0; i < section.imageCount; i++) {
          // Generate image
          const image = await generateImageWithGemini(prompt, config);
          
          // Send update to client
          controller.enqueue(encoder.encode(
            `event: image-generated\n` +
            `data: ${JSON.stringify(image)}\n\n`
          ));
        }
        
        // Signal section complete
        controller.enqueue(encoder.encode(
          `event: section-complete\n` +
          `data: ${JSON.stringify({ sectionId: section.id })}\n\n`
        ));
      }
      
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

---

## 8. UI/UX Improvements

### 8.1 Single Page Design Benefits

✅ **Faster workflow** - All settings visible, no navigation
✅ **Better overview** - See what's being generated in real-time
✅ **More control** - Adjust settings while watching progress
✅ **Responsive** - Sidebar collapses on mobile

### 8.2 Real-Time Preview Benefits

✅ **Immediate feedback** - Don't wait for all images
✅ **Early review** - Check first few images for quality
✅ **Confidence** - See results as they generate
✅ **Faster iteration** - Regenerate while others generate

### 8.3 Copy to Clipboard Benefits

✅ **Faster workflow** - Copy → Paste in Figma instantly
✅ **No download required** - For individual images
✅ **Clipboard caching** - Multiple images in workflow
✅ **Native experience** - Feels like OS native feature

---

## 9. Implementation Priority

### Phase 1: MVP + New Layout (Weeks 1-4)
- [x] Single-page layout with sidebar
- [x] Website category + custom input
- [x] Basic image generation
- [x] Image gallery with copy button
- [x] Download per section/all with format selector
- [x] Real-time blur preview

### Phase 2: AI Features (Weeks 5-8)
- [x] Description refinement with AI
- [x] Image reference upload + style extraction
- [x] Auto-fill section details
- [x] Extracted prompt editing

### Phase 3: Polish (Weeks 9-12)
- [x] Image regeneration with new reference
- [x] Copy to clipboard perfection
- [x] Mobile responsiveness
- [x] Performance optimization

---

## 10. Success Metrics (ASSETO)

### MVP Goals
- Generate 10 images per section in <5 minutes
- 98%+ download success rate
- 100% copy-to-clipboard success
- Sub-2 second page load
- 4.5+ star rating

### Advanced Features
- AI refinement suggestions accepted 70%+ of time
- Style reference extraction success 90%+
- Section auto-fill accuracy 85%+
- Real-time generation preview adoption 80%+

---

## 11. Competitive Advantages

**ASSETO vs Alternatives**:
- ✅ **Free style extraction** from reference images
- ✅ **AI description refinement** built-in
- ✅ **Auto-fill sections** saves hours
- ✅ **Real-time preview** - don't wait
- ✅ **Copy to clipboard** - paste anywhere
- ✅ **Single-page interface** - super fast workflow
- ✅ **Multiple download formats** - flexibility
- ✅ **Unlimited custom categories** - flexibility

---

## 12. Appendix: Feature Specifications

### A. Image Quality Tiers

```
1K:  1024x1024  → Fast (15-20 sec), basic quality
2K:  2048x2048  → Balanced (25-30 sec), professional
4K:  4096x4096  → Premium (35-45 sec), ultra detail
```

### B. Supported Formats

```
PNG:  .png  (lossless, larger file)
JPG:  .jpg  (compressed, smaller, lossy)
WebP: .webp (modern, compressed, better quality)
```

### C. Aspect Ratios

```
16:9  (landscape - hero sections)
1:1   (square - cards, thumbnails)
9:16  (portrait - mobile)
3:2   (classic)
4:5   (Instagram vertical)
5:4   (portrait)
3:1   (ultra wide)
```

### D. Style Types (Predefined)

```
Realistic Photography    → Photos
Professional Photoshoot → Studio shots
Illustration            → Hand-drawn style
3D Rendering           → 3D models
Cartoon                → Comic style
Abstract               → Modern art
Minimalist             → Simple, clean
Image Reference        → Upload your own
```

---

**Document Status**: ✅ READY FOR DEVELOPMENT  
**Product Name**: ASSETO  
**Version**: 2.0  
**Last Updated**: December 2025  

---