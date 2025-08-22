import React, { useState, useEffect, useRef } from 'react';
import { VideoScriptScene } from '../types';
import { RefreshIcon } from './icons';

interface ResultDisplayProps {
  summary: string;
  script: VideoScriptScene[] | null;
  videoUrls: string[];
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ summary, script, videoUrls, onReset }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    if (currentVideoIndex < videoUrls.length - 1) {
      setCurrentVideoIndex(prevIndex => prevIndex + 1);
    }
  };
  
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.play().catch(error => {
            console.warn("Autoplay was prevented by the browser.", error);
        });
    }
  }, [currentVideoIndex, videoUrls]);


  return (
    <div className="w-full max-w-5xl animate-fade-in space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-cyan-400">Your BookReel is Ready!</h2>
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-transform transform hover:scale-105"
            >
                <RefreshIcon className="w-5 h-5"/>
                Create Another
            </button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Summary Card */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">AI Summary</h3>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
          
          {/* Script Card */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">Video Script</h3>
            <div className="space-y-6">
              {script?.map((scene) => (
                <div key={scene.scene} className="p-4 border-l-4 border-cyan-500 bg-gray-900/50 rounded-r-lg">
                  <h4 className="font-bold text-lg text-cyan-400">Scene {scene.scene}</h4>
                  <p className="mt-2 text-gray-300"><span className="font-semibold text-gray-400">Visual:</span> {scene.visual}</p>
                  <p className="mt-2 text-gray-300"><span className="font-semibold text-gray-400">Narration:</span> "{scene.narration}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Video Player Card */}
        <div className="lg:col-span-2">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg sticky top-8">
                <h3 className="text-2xl font-bold mb-4 text-purple-400">Generated Video</h3>
                {videoUrls && videoUrls.length > 0 ? (
                  <>
                    <video
                        ref={videoRef}
                        key={videoUrls[currentVideoIndex]}
                        controls
                        autoPlay
                        onEnded={handleVideoEnd}
                        src={videoUrls[currentVideoIndex]}
                        className="w-full rounded-lg aspect-video bg-black"
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className="flex justify-center items-center mt-4 space-x-2">
                        {videoUrls.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentVideoIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    index === currentVideoIndex ? 'bg-cyan-400' : 'bg-gray-600 hover:bg-gray-500'
                                }`}
                                aria-label={`Go to video clip ${index + 1}`}
                            />
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-400 mt-2">
                        Clip {currentVideoIndex + 1} of {videoUrls.length}
                    </p>
                  </>
                ) : (
                <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Video could not be loaded.</p>
                </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;