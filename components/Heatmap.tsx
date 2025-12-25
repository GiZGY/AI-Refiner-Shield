import React from 'react';

interface Segment {
    text: string;
    score: float;
    start: int;
    end: int;
}

interface HeatmapProps {
    segments: Segment[];
}

const Heatmap: React.FC<HeatmapProps> = ({ segments }) => {
    const getColor = (score: number) => {
        if (score < 0.3) return 'bg-green-200 dark:bg-green-900/30';
        if (score < 0.7) return 'bg-yellow-200 dark:bg-yellow-900/30';
        return 'bg-red-200 dark:bg-red-900/30';
    };

    return (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm min-h-[300px] whitespace-pre-wrap leading-relaxed">
            {segments.map((seg, idx) => (
                <span
                    key={idx}
                    className={`${getColor(seg.score)} transition-colors duration-300 hover:opacity-80 cursor-default`}
                    title={`AI Probability: ${(seg.score * 100).toFixed(1)}%`}
                >
                    {seg.text}
                </span>
            ))}
        </div>
    );
};

export default Heatmap;
