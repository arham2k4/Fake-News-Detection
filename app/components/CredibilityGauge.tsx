"use client";

import { useEffect, useState } from "react";

interface CredibilityGaugeProps {
    score: number;
    size?: number;
    showLabel?: boolean;
}

export default function CredibilityGauge({
    score,
    size = 160,
    showLabel = true,
}: CredibilityGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedScore(score);
        }, 100);
        return () => clearTimeout(timer);
    }, [score]);

    const strokeWidth = size * 0.08;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedScore / 100) * circumference;
    const center = size / 2;

    // Color based on score
    const getColor = () => {
        if (animatedScore >= 75) return { stroke: "#34d399", glow: "rgba(52, 211, 153, 0.3)" };
        if (animatedScore >= 50) return { stroke: "#fbbf24", glow: "rgba(251, 191, 36, 0.3)" };
        if (animatedScore >= 25) return { stroke: "#fb923c", glow: "rgba(251, 146, 60, 0.3)" };
        return { stroke: "#fb7185", glow: "rgba(251, 113, 133, 0.3)" };
    };

    const getLabel = () => {
        if (score >= 75) return "Reliable";
        if (score >= 50) return "Uncertain";
        if (score >= 25) return "Suspicious";
        return "Unreliable";
    };

    const color = getColor();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                    style={{ filter: `drop-shadow(0 0 12px ${color.glow})` }}
                >
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="rgba(51, 65, 85, 0.4)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={color.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-bold tabular-nums transition-colors duration-500"
                        style={{ fontSize: size * 0.22, color: color.stroke }}
                    >
                        {Math.round(animatedScore)}
                    </span>
                    <span className="text-text-muted" style={{ fontSize: size * 0.09 }}>
                        / 100
                    </span>
                </div>
            </div>

            {showLabel && (
                <span
                    className="text-sm font-semibold px-3 py-1 rounded-full transition-colors duration-500"
                    style={{
                        color: color.stroke,
                        backgroundColor: `${color.stroke}15`,
                    }}
                >
                    {getLabel()}
                </span>
            )}
        </div>
    );
}
