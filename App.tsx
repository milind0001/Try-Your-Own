import React, { useState, useCallback } from 'react';
import type { UploadedImage } from './types';
import { generateVirtualTryOn } from './services/geminiService';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [outfitImages, setOutfitImages] = useState<UploadedImage[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTryOn = useCallback(async () => {
    if (!personImage || outfitImages.length === 0) {
      setError('Please upload your photo and at least one outfit image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const outfitFiles = outfitImages.map(img => img.file);
      const generatedImage = await generateVirtualTryOn(personImage.file, outfitFiles);
      if (generatedImage) {
        setResultImage(generatedImage);
      } else {
        setError('Could not generate an image. The model may not have returned an image result.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [personImage, outfitImages]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <p className="text-center text-gray-400 max-w-2xl mb-8">
          Welcome to the future of shopping. Upload a clear, full-body photo of yourself and one or more photos of an outfit you like. Our AI will show you how it looks on you in seconds.
        </p>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <ImageUploader
            id="person-uploader"
            title="Upload Your Photo"
            onImagesUpload={(images) => setPersonImage(images[0] || null)}
            description="A clear, forward-facing photo works best."
          />
          <ImageUploader
            id="outfit-uploader"
            title="Upload Outfit Photo(s)"
            onImagesUpload={setOutfitImages}
            description="Use photos of garments on a plain background."
            multiple
          />
        </div>

        <button
          onClick={handleTryOn}
          disabled={!personImage || outfitImages.length === 0 || isLoading}
          className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-indigo-600/30"
        >
          {isLoading ? 'Generating...' : 'Virtual Try-On'}
        </button>

        <div className="w-full max-w-2xl mt-8 p-4 bg-gray-800 rounded-lg shadow-xl min-h-[300px] flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <Loader />
              <p className="mt-4 text-gray-300 animate-pulse">Our AI is stitching your new look...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center">
              <h3 className="font-bold text-lg">An Error Occurred</h3>
              <p>{error}</p>
            </div>
          ) : resultImage ? (
            <div className="relative group w-full h-full">
              <img src={resultImage} alt="Virtual try-on result" className="rounded-md max-w-full h-auto object-contain" />
              <a
                href={resultImage}
                download="virtual-try-on.png"
                className="absolute top-2 right-2 bg-black/60 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Download image"
              >
                <DownloadIcon />
              </a>
            </div>
          ) : (
            <p className="text-gray-500">Your generated image will appear here.</p>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-gray-600 text-sm">
        Develop with love by Milind Patil
      </footer>
    </div>
  );
};

export default App;