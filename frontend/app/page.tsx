'use client';

import React, { useState } from 'react';
import { Shield, RefreshCw, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import Heatmap from '../components/Heatmap';

interface Segment {
    text: string;
    score: number;
    start: number;
    end: number;
}

interface DetectionResponse {
    overall_score: number;
    segments: Segment[];
    provider: string;
}

interface RefineResponse {
    original_text: string;
    refined_text: string;
    final_score: number;
    iterations_used: number;
    history: any[];
}

export default function Home() {
    const [inputText, setInputText] = useState('');
    const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [refineResult, setRefineResult] = useState<RefineResponse | null>(null);

    const handleDetect = async () => {
        if (!inputText.trim()) return;
        setIsDetecting(true);
        setDetectionResult(null);
        setRefineResult(null);

        try {
            const response = await fetch('http://localhost:8000/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText }),
            });
            const data = await response.json();
            setDetectionResult(data);
        } catch (error) {
            console.error('Detection failed:', error);
            alert('Detection failed. Is the backend running?');
        } finally {
            setIsDetecting(false);
        }
    };

    const handleRefine = async () => {
        if (!inputText.trim()) return;
        setIsRefining(true);

        try {
            const response = await fetch('http://localhost:8000/refine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText, target_score: 0.2 }),
            });
            const data = await response.json();
            setRefineResult(data);
            // Update detection view with the refined text and its (implied) low score
            // For now, we just show the refined text. 
            // Ideally, we should re-detect the refined text to get segments.
            setInputText(data.refined_text);

            // Mock re-detection for the heatmap update
            // In a real app, the refine endpoint might return segments or we call detect again.
            // Let's call detect on the new text to update the heatmap.
            const detectResponse = await fetch('http://localhost:8000/detect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: data.refined_text }),
            });
            const detectData = await detectResponse.json();
            setDetectionResult(detectData);

        } catch (error) {
            console.error('Refinement failed:', error);
            alert('Refinement failed.');
        } finally {
            setIsRefining(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xl font-bold tracking-tight">AI-Refiner-Shield</span>
                    </div>
                    <nav className="flex space-x-4">
                        <button className="text-sm font-medium hover:text-indigo-600 transition-colors">Pricing</button>
                        <button className="text-sm font-medium hover:text-indigo-600 transition-colors">Login</button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-10rem)]">

                    {/* Left: Input */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2 dark:bg-indigo-900 dark:text-indigo-300">Input</span>
                                Your Text
                            </h2>
                            <div className="space-x-2">
                                <button
                                    onClick={handleDetect}
                                    disabled={isDetecting || isRefining}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isDetecting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                                    Detect AI
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="flex-1 w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 transition-shadow shadow-sm"
                            placeholder="Paste your text here to check for AI patterns..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>

                    {/* Right: Output / Heatmap */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center">
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2 dark:bg-green-900 dark:text-green-300">Analysis</span>
                                AI Probability Heatmap
                            </h2>
                            <button
                                onClick={handleRefine}
                                disabled={isDetecting || isRefining || !detectionResult}
                                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm transition-all disabled:opacity-50"
                            >
                                {isRefining ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                                Smart Refine
                            </button>
                        </div>

                        <div className="flex-1 relative">
                            {detectionResult ? (
                                <div className="absolute inset-0 overflow-auto">
                                    <div className="mb-4 flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">Overall AI Score:</div>
                                            <div className={`text-2xl font-bold ${detectionResult.overall_score > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                                                {(detectionResult.overall_score * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        {refineResult && (
                                            <div className="text-xs text-gray-500">
                                                Refined in {refineResult.iterations_used} iterations
                                            </div>
                                        )}
                                    </div>
                                    <Heatmap segments={detectionResult.segments} />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-400">
                                    <div className="text-center">
                                        <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Run detection to see the heatmap</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
