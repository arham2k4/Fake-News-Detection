"use client";

import { useState } from "react";
import {
    GitCompareArrows,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import CompareCard from "../components/CompareCard";
import { LoadingSpinner } from "../components/LoadingState";

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

interface CompareResult {
    topic_summary: string;
    articles: CompareArticle[];
    overall_assessment: string;
    consensus_points: string[];
    divergence_points: string[];
    recommendation: string;
}

export default function ComparePage() {
    const [topic, setTopic] = useState("");
    const [result, setResult] = useState<CompareResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = topic.trim();
        if (!trimmed || loading) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/compare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: trimmed }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Comparison failed (${res.status})`);
            }

            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-violet/20 to-purple-500/20 mb-2">
                        <GitCompareArrows className="w-7 h-7 text-accent-violet" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                        Compare <span className="gradient-text">News Coverage</span>
                    </h1>
                    <p className="text-text-secondary max-w-lg mx-auto">
                        Enter a topic to see how different news sources cover it. Compare
                        tone, bias, and emphasis across outlets.
                    </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-slide-up">
                    <div className="glass-card p-2">
                        <div className="flex items-center gap-2 px-4 py-1">
                            <GitCompareArrows className="w-5 h-5 text-accent-violet shrink-0" />
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Enter a news topic (e.g., 'AI regulation 2025')"
                                className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-base py-3"
                            />
                            <button
                                type="submit"
                                disabled={!topic.trim() || loading}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all"
                            >
                                Compare
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Example topics */}
                {!result && !loading && !error && (
                    <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                        <span className="text-xs text-text-muted">Try:</span>
                        {[
                            "Climate change policy",
                            "AI regulation",
                            "Space exploration 2025",
                            "Global economy forecast",
                        ].map((example) => (
                            <button
                                key={example}
                                onClick={() => setTopic(example)}
                                className="text-xs text-text-secondary px-3 py-1.5 rounded-full border border-surface-3 hover:border-accent-violet/30 hover:text-accent-violet transition-all"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="glass-card-sm p-4 border-accent-rose/30 animate-fade-in max-w-2xl mx-auto">
                        <p className="text-sm text-accent-rose">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <LoadingSpinner message="Fetching articles and comparing coverage..." />
                )}

                {/* Results */}
                {result && !loading && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Topic Summary */}
                        <div className="glass-card p-6 max-w-3xl mx-auto">
                            <h2 className="text-lg font-semibold text-text-primary mb-2">
                                Topic Overview
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {result.topic_summary}
                            </p>
                        </div>

                        {/* Article Cards Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {result.articles.map((article, i) => (
                                <CompareCard key={i} article={article} index={i} />
                            ))}
                        </div>

                        {/* Consensus & Divergence */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Consensus */}
                            {result.consensus_points && result.consensus_points.length > 0 && (
                                <div className="glass-card p-5 space-y-3">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-emerald">
                                        <CheckCircle className="w-4 h-4" />
                                        Sources Agree On
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.consensus_points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-emerald shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Divergence */}
                            {result.divergence_points && result.divergence_points.length > 0 && (
                                <div className="glass-card p-5 space-y-3">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-amber">
                                        <AlertTriangle className="w-4 h-4" />
                                        Sources Differ On
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.divergence_points.map((point, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-amber shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Overall Assessment */}
                        <div className="glass-card p-6 max-w-3xl mx-auto">
                            <h2 className="text-lg font-semibold text-text-primary mb-2">
                                Overall Assessment
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-4">
                                {result.overall_assessment}
                            </p>
                            {result.recommendation && (
                                <div className="p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/10">
                                    <p className="text-sm text-accent-cyan">
                                        <strong>Recommendation:</strong> {result.recommendation}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
