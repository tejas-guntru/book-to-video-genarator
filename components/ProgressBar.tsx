import React, { useState, useEffect } from 'react';
import { Stage } from '../types';
import { DocumentIcon, SparklesIcon, FilmIcon, VideoCameraIcon, CheckCircleIcon } from './icons';

interface ProgressBarProps {
    stage: Stage;
    videoProgress: { current: number; total: number } | null;
}

const STAGES_CONFIG = [
    { id: Stage.PARSING, text: 'Parsing PDF', icon: DocumentIcon },
    { id: Stage.SUMMARIZING, text: 'Summarizing Book', icon: SparklesIcon },
    { id: Stage.CREATING_SCRIPT, text: 'Creating Script', icon: FilmIcon },
    { id: Stage.GENERATING_VIDEO, text: 'Generating Video', icon: VideoCameraIcon }
];

const VIDEO_GENERATION_MESSAGES = [
    "Contacting the digital director...",
    "Warming up the AI cameras...",
    "Rendering cinematic visuals...",
    "This can take a few minutes, please wait...",
    "Compositing scenes together...",
    "Adding a touch of AI magic...",
    "Finalizing the master cut...",
];

const ProgressBar: React.FC<ProgressBarProps> = ({ stage, videoProgress }) => {
    const currentIndex = STAGES_CONFIG.findIndex(s => s.id === stage);
    const [videoMessage, setVideoMessage] = useState(VIDEO_GENERATION_MESSAGES[0]);

    useEffect(() => {
        if (stage === Stage.GENERATING_VIDEO) {
            const interval = setInterval(() => {
                setVideoMessage(prev => {
                    const nextIndex = (VIDEO_GENERATION_MESSAGES.indexOf(prev) + 1) % VIDEO_GENERATION_MESSAGES.length;
                    return VIDEO_GENERATION_MESSAGES[nextIndex];
                });
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [stage]);

    return (
        <div className="w-full max-w-3xl p-8 bg-gray-800 rounded-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-8 text-cyan-400">Processing Your Book...</h2>
            <div className="flex items-center justify-between">
                {STAGES_CONFIG.map((s, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    return (
                        <React.Fragment key={s.id}>
                            <div className="flex flex-col items-center text-center w-32">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 border-4 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-400' : isActive ? 'bg-cyan-500 border-cyan-400 animate-pulse' : 'bg-gray-700 border-gray-600'}`}>
                                    {isCompleted ? <CheckCircleIcon className="w-8 h-8 text-white"/> : <s.icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-gray-400'}`}/>}
                                </div>
                                <p className={`font-semibold transition-colors duration-300 ${isCompleted ? 'text-green-400' : isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
                                   {s.id === Stage.GENERATING_VIDEO && isActive && videoProgress
                                        ? `${s.text} (${videoProgress.current}/${videoProgress.total})`
                                        : s.text
                                    }
                                </p>
                            </div>
                            {index < STAGES_CONFIG.length - 1 && <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`}></div>}
                        </React.Fragment>
                    );
                })}
            </div>
            {stage === Stage.GENERATING_VIDEO && (
                <div className="mt-8 text-center text-lg text-purple-300 p-4 bg-purple-900/50 rounded-lg">
                    <p>{videoMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ProgressBar;