"use client";

import CredibilityGauge from "./CredibilityGauge";
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    HelpCircle,
    ExternalLink,
    AlertOctagon,
    Brain,
} from "lucide-react";

interface AnalysisResult {
    credibility_score: number;
    classification: string;
    summary: string;
    explanation: string;
    tone_analysis?: string;
    bias_indicators?: string[];
    issues?: string[];
    sources?: string[];
    missing_context?: string;
}

interface ResultCardProps {
    result: AnalysisResult;
}

function getClassificationStyle(classification: string) {
    switch (classification.toLowerCase()) {
        case "real":
            return {
                icon: CheckCircle,
                color: "text-accent-emerald",
                bg: "bg-accent-emerald/10",
                border: "border-accent-emerald/30",
            };
        case "fake":
            return {
                icon: XCircle,
                color: "text-accent-rose",
                bg: "bg-accent-rose/10",
                border: "border-accent-rose/30",
            };
        case "misleading":
            return {
                icon: AlertTriangle,
                color: "text-accent-amber",
                bg: "bg-accent-amber/10",
                border: "border-accent-amber/30",
            };
        default:
            return {
                icon: HelpCircle,
                color: "text-accent-violet",
                bg: "bg-accent-violet/10",
                border: "border-accent-violet/30",
            };
    }
}

export default function ResultCard({ result }: ResultCardProps) {
    const style = getClassificationStyle(result.classification);
    const Icon = style.icon;

    return (
        <div className="glass-card p-6 animate-slide-up space-y-6">
            {/* Header: Classification + Score */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <CredibilityGauge score={result.credibility_score} size={140} />

                <div className="flex-1 text-center sm:text-left space-y-3">
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${style.bg} ${style.color} border ${style.border}`}
                    >
                        <Icon className="w-5 h-5" />
                        {result.classification}
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        {result.summary}
                    </p>
                </div>
            </div>

            {/* Explanation */}
            <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                    <Brain className="w-4 h-4 text-accent-cyan" />
                    AI Explanation
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed pl-6">
                    {result.explanation}
                </p>
            </div>

            {/* Tone Analysis */}
            {result.tone_analysis && (
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <AlertTriangle className="w-4 h-4 text-accent-amber" />
                        Tone Analysis
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed pl-6">
                        {result.tone_analysis}
                    </p>
                </div>
            )}

            {/* Issues */}
            {result.issues && result.issues.length > 0 && (
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <AlertOctagon className="w-4 h-4 text-accent-rose" />
                        Issues Detected
                    </h3>
                    <ul className="space-y-1 pl-6">
                        {result.issues.map((issue, i) => (
                            <li key={i} className="text-sm text-accent-rose/80 flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-rose/60 shrink-0" />
                                {issue}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Bias Indicators */}
            {result.bias_indicators && result.bias_indicators.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                        Bias Indicators
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-6">
                        {result.bias_indicators.map((bias, i) => (
                            <span
                                key={i}
                                className="text-xs px-3 py-1 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20"
                            >
                                {bias}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Missing Context */}
            {result.missing_context && (
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary">
                        Missing Context
                    </h3>
                    <p className="text-text-muted text-sm pl-6 italic">
                        {result.missing_context}
                    </p>
                </div>
            )}

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
                <div className="space-y-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <ExternalLink className="w-4 h-4 text-accent-cyan" />
                        Sources Referenced
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-6">
                        {result.sources.map((source, i) => (
                            <span
                                key={i}
                                className="text-xs px-3 py-1.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                            >
                                {source}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
