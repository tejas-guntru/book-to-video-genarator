import { GoogleGenAI, Type } from "@google/genai";
import { VideoScriptScene } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeBook = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following text from a book, provide a detailed, insightful summary of about 500-700 words. The summary should capture the main plot points, key themes, character arcs, and the overall message of the book. Make it engaging and comprehensive.\n\n---\n\n${text}`,
            config: {
                temperature: 0.5,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error in summarizeBook:", error);
        throw new Error("Failed to generate summary from Gemini API.");
    }
};

export const createVideoScript = async (summary: string): Promise<VideoScriptScene[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on this book summary, create a script for a 2-minute promotional video. The script must have exactly 8 scenes. Each scene should be suitable for a 15-second video clip. For each scene, provide a scene number, a detailed and vivid visual description suitable for an AI video generation model, and a corresponding narration script. The narration should be concise and powerful.
            
            SUMMARY:
            ${summary}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            scene: {
                                type: Type.INTEGER,
                                description: 'The scene number, starting from 1.',
                            },
                            visual: {
                                type: Type.STRING,
                                description: 'A detailed, cinematic visual description for the scene.',
                            },
                            narration: {
                                type: Type.STRING,
                                description: 'The narration voiceover for this scene.',
                            },
                        },
                        required: ["scene", "visual", "narration"],
                    },
                },
            },
        });

        const jsonString = response.text.trim();
        const scriptData = JSON.parse(jsonString);

        if (!Array.isArray(scriptData) || scriptData.some(item => !item.scene || !item.visual || !item.narration)) {
             throw new Error("Invalid script format received from API.");
        }

        return scriptData as VideoScriptScene[];
    } catch (error) {
        console.error("Error in createVideoScript:", error);
        throw new Error("Failed to generate video script from Gemini API.");
    }
};

export const generateVideo = async (prompt: string): Promise<string> => {
    try {
        const fullPrompt = `A 15-second cinematic video clip of: ${prompt}`;
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfVideos: 1,
            }
        });

        console.log("Video generation started. Operation:", operation);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
            console.log("Polling video generation status:", operation);
        }

        if (operation.error) {
            throw new Error(`Video generation failed with error: ${operation.error.message}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation finished but no download link was provided.");
        }

        // Fetch the video as a blob and create an object URL
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video file. Status: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        return videoUrl;
    } catch (error) {
        console.error("Error in generateVideo:", error);
        throw new Error("Failed to generate video from Gemini API.");
    }
};