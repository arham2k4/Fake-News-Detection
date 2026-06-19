"use client";

import {
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    Zap,
    ExternalLink,
} from "lucide-react";

interface CompareArticle {
    source: string;
    headline: string;
    tone: string;
    bias: string;
    key_emphasis: string;
    credibility_score: number;
    notable_omissions: string;
    url: string;
}

interface CompareCardProps {
    article: CompareArticle;
    index: number;
}

function getToneIcon(tone: string) {
    switch (tone.toLowerCase()) {
        case "positive":
            return <TrendingUp className="w-4 h-4 text-accent-emerald" />;
        case "negative":
            return <TrendingDown className="w-4 h-4 text-accent-rose" />;
        case "sensational":
        case "alarmist":
            return <Zap className="w-4 h-4 text-accent-amber" />;
        default:
            return <Minus className="w-4 h-4 text-text-muted" />;
    }
}

function getToneColor(tone: string) {
    switch (tone.toLowerCase()) {
        case "positive":
            return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
        case "negative":
            return "text-accent-rose bg-accent-rose/10 border-accent-rose/20";
        case "sensational":
        case "alarmist":
            return "text-accent-amber bg-accent-amber/10 border-accent-amber/20";
        default:
            return "text-text-secondary bg-surface-2 border-surface-3";
    }
}

function getBiasColor(bias: string) {
    switch (bias.toLowerCase()) {
        case "left":
            return "text-blue-400 bg-blue-400/10 border-blue-400/20";
        case "center-left":
            return "text-sky-400 bg-sky-400/10 border-sky-400/20";
        case "center":
            return "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20";
        case "center-right":
            return "text-orange-400 bg-orange-400/10 border-orange-400/20";
        case "right":
            return "text-red-400 bg-red-400/10 border-red-400/20";
        default:
            return "text-text-muted bg-surface-2 border-surface-3";
    }
}

function getScoreColor(score: number) {
    if (score >= 75) return "text-accent-emerald";
    if (score >= 50) return "text-accent-amber";
    return "text-accent-rose";
}

export default function CompareCard({ article, index }: CompareCardProps) {
    return (
        <div
            className="glass-card p-5 space-y-4 animate-slide-up hover:border-accent-cyan/30 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Source & Score */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-xs text-text-muted uppercase tracking-wider block">
                        Source
                    </span>
                    <h3 className="text-base font-semibold text-text-primary flex items-center gap-1.5">
                        <span className="truncate" title={article.source}>{article.source}</span>
                        {article.url && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-accent-cyan hover:text-accent-cyan/80 transition-colors" title="Read original article">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </h3>
                </div>
                <div className="text-right shrink-0">
                    <span className="text-xs text-text-muted">Score</span>
                    <p className={`text-2xl font-bold tabular-nums ${getScoreColor(article.credibility_score)}`}>
                        {article.credibility_score}
                    </p>
                </div>
            </div>

            {/* Headline */}
            {article.url ? (
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-secondary leading-relaxed font-medium hover:text-accent-cyan transition-colors">
                    &ldquo;{article.headline}&rdquo;
                </a>
            ) : (
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    &ldquo;{article.headline}&rdquo;
                </p>
            )}

            {/* Tone & Bias */}
            <div className="flex flex-wrap gap-2">
                <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${getToneColor(
                        article.tone
                    )}`}
                >
                    {getToneIcon(article.tone)}
                    {article.tone}
                </span>
                <span
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium ${getBiasColor(
                        article.bias
                    )}`}
                >
                    {article.bias}
                </span>
            </div>

            {/* Key Emphasis */}
            <div className="space-y-1">
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Key Focus
                </span>
                <p className="text-sm text-text-secondary leading-relaxed">
                    {article.key_emphasis}
                </p>
            </div>

            {/* Omissions */}
            {article.notable_omissions && article.notable_omissions !== "None" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-amber/5 border border-accent-amber/10">
                    <AlertTriangle className="w-4 h-4 text-accent-amber mt-0.5 shrink-0" />
                    <div>
                        <span className="text-xs text-accent-amber font-semibold uppercase tracking-wider">
                            Notable Omissions
                        </span>
                        <p className="text-xs text-text-muted mt-0.5">{article.notable_omissions}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
