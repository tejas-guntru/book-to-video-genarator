import React, { useState, useCallback, useMemo } from 'react';
import { Stage, VideoScriptScene } from './types';
import FileUpload from './components/FileUpload';
import ProgressBar from './components/ProgressBar';
import ResultDisplay from './components/ResultDisplay';
import { extractText } from './services/pdfService';
import { summarizeBook, createVideoScript, generateVideo } from './services/geminiService';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>(Stage.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [script, setScript] = useState<VideoScriptScene[] | null>(null);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState<{ current: number; total: number } | null>(null);

  const handleFileProcess = useCallback(async (file: File) => {
    setError(null);
    setSummary('');
    setScript(null);
    setVideoUrls([]);
    setVideoGenerationProgress(null);
    
    try {
      // 1. Parsing PDF
      setStage(Stage.PARSING);
      const text = await extractText(file);
      const truncatedText = text.substring(0, 150000); // Use a generous portion of the book

      // 2. Summarizing Text
      setStage(Stage.SUMMARIZING);
      const bookSummary = await summarizeBook(truncatedText);
      setSummary(bookSummary);

      // 3. Creating Script
      setStage(Stage.CREATING_SCRIPT);
      const videoScript = await createVideoScript(bookSummary);
      setScript(videoScript);

      // 4. Generating Videos
      setStage(Stage.GENERATING_VIDEO);
      const generatedUrls: string[] = [];
      if (videoScript && videoScript.length > 0) {
        const totalVideos = videoScript.length;
        for (let i = 0; i < totalVideos; i++) {
          const scene = videoScript[i];
          setVideoGenerationProgress({ current: i + 1, total: totalVideos });
          const generatedVideoUrl = await generateVideo(scene.visual);
          generatedUrls.push(generatedVideoUrl);
        }
        setVideoUrls(generatedUrls);
      } else {
        throw new Error("Failed to generate a video script.");
      }
      
      setVideoGenerationProgress(null);
      setStage(Stage.DONE);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Processing failed: ${errorMessage}. Please check the console for details and try again.`);
      setStage(Stage.IDLE);
    }
  }, []);

  const resetState = () => {
    setStage(Stage.IDLE);
    setError(null);
    setSummary('');
    setScript(null);
    setVideoUrls([]);
    setVideoGenerationProgress(null);
  };
  
  const currentView = useMemo(() => {
    if (stage === Stage.IDLE) {
      return <FileUpload onFileUpload={handleFileProcess} error={error} />;
    }
    if (stage === Stage.DONE) {
      return <ResultDisplay summary={summary} script={script} videoUrls={videoUrls} onReset={resetState} />;
    }
    return <ProgressBar stage={stage} videoProgress={videoGenerationProgress} />;
  }, [stage, handleFileProcess, error, summary, script, videoUrls, videoGenerationProgress]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl flex items-center justify-center mb-8">
        <LogoIcon className="h-10 w-10 text-cyan-400" />
        <h1 className="text-4xl sm:text-5xl font-bold ml-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
          BookReel AI
        </h1>
      </header>
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-center">
        {currentView}
      </main>
      <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 text-sm">
        <p>Upload a book PDF and watch AI create a video summary.</p>
        <p className="mt-1">Please note: AI-generated content may be inaccurate. Video generation can take several minutes.</p>
      </footer>
    </div>
  );
};

export default App;