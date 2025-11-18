import React, { useState, useEffect, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { generatePrompt, generateImage } from './services/geminiService';
import {
  ImageFile,
  StyleOptions,
  AspectRatio,
  LightingStyle,
  CameraPerspective,
} from './types';
import {
  ASPECT_RATIO_OPTIONS,
  LIGHTING_STYLE_OPTIONS,
  CAMERA_PERSPECTIVE_OPTIONS,
} from './constants';
import { LoadingSpinner } from './components/icons';

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [styleReferenceImage, setStyleReferenceImage] = useState<ImageFile | null>(null);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    aspectRatio: AspectRatio.SQUARE,
    lightingStyle: LightingStyle.STUDIO,
    cameraPerspective: CameraPerspective.EYE_LEVEL,
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStyleOptions(prev => ({ ...prev, [name]: value }));
  };

  const memoizedGeneratePrompt = useCallback(async () => {
    setIsPromptLoading(true);
    setError(null);
    try {
      const prompt = await generatePrompt(styleOptions, styleReferenceImage ?? undefined);
      setGeneratedPrompt(prompt);
    } catch (err) {
      setError("Failed to generate prompt.");
      console.error(err);
    } finally {
      setIsPromptLoading(false);
    }
  }, [styleOptions, styleReferenceImage]);


  useEffect(() => {
      const handler = setTimeout(() => {
        memoizedGeneratePrompt();
      }, 500); // Debounce prompt generation

      return () => {
          clearTimeout(handler);
      };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleOptions, styleReferenceImage]); // Re-run when options or reference image changes


  const handleGenerateImage = async () => {
    if (!productImage || !generatedPrompt) {
      setError("Please upload a product image and ensure a prompt is generated.");
      return;
    }
    setIsImageLoading(true);
    setGeneratedImage(null);
    setError(null);
    try {
      const imageUrl = await generateImage(productImage, generatedPrompt, styleReferenceImage ?? undefined);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
            Creative Banana
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Generate professional product photos with Nano Banana
          </p>
        </header>

        {error && (
            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-md relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">1. Upload & Style</h2>
            <ImageUploader id="product-upload" label="Product Photo" onImageUpload={setProductImage} />
            
            <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
              <select id="aspectRatio" name="aspectRatio" value={styleOptions.aspectRatio} onChange={handleStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                {ASPECT_RATIO_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="lightingStyle" className="block text-sm font-medium text-gray-300">Lighting Style</label>
              <select id="lightingStyle" name="lightingStyle" value={styleOptions.lightingStyle} onChange={handleStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                {LIGHTING_STYLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="cameraPerspective" className="block text-sm font-medium text-gray-300">Camera Perspective</label>
              <select id="cameraPerspective" name="cameraPerspective" value={styleOptions.cameraPerspective} onChange={handleStyleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                {CAMERA_PERSPECTIVE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>

            <ImageUploader id="style-ref-upload" label="Style Reference (Optional)" onImageUpload={setStyleReferenceImage} />
          </div>

          {/* Generation Area */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold border-b border-gray-700 pb-2">2. Generate</h2>
            <div>
              <label htmlFor="generatedPrompt" className="block text-sm font-medium text-gray-300">Generated AI Prompt</label>
              <div className="relative">
                <textarea
                  id="generatedPrompt"
                  rows={6}
                  className="mt-1 block w-full shadow-sm sm:text-sm bg-gray-900 border-gray-600 rounded-md p-3 pr-10"
                  value={generatedPrompt}
                  readOnly
                  placeholder="Your detailed prompt will appear here..."
                />
                {isPromptLoading && <div className="absolute top-3 right-3"><LoadingSpinner className="h-5 w-5 text-red-400" /></div>}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isImageLoading || !productImage || !generatedPrompt}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isImageLoading && <LoadingSpinner />}
              {isImageLoading ? 'Generating...' : 'Generate Image'}
            </button>
            
            <div className="mt-4">
               <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
               <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                  {isImageLoading && <LoadingSpinner className="w-10 h-10 text-red-500"/>}
                  {!isImageLoading && generatedImage && (
                    <img src={generatedImage} alt="Generated result" className="w-full h-full object-contain rounded-lg" />
                  )}
                   {!isImageLoading && !generatedImage && (
                    <p className="text-gray-500">Your generated image will appear here</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;