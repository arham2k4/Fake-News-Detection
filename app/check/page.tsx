"use client";

import { useState } from "react";
import { Search, Link as LinkIcon, Type, ArrowRight } from "lucide-react";
import ResultCard from "../components/ResultCard";
import { LoadingSkeleton } from "../components/LoadingState";

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

export default function CheckPage() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed || loading) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: trimmed }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Analysis failed (${res.status})`);
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

    const isUrl = query.trim().startsWith("http");

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-3 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-emerald/20 to-teal-500/20 mb-2">
                        <Search className="w-7 h-7 text-accent-emerald" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
                        Check This <span className="gradient-text">News</span>
                    </h1>
                    <p className="text-text-secondary max-w-lg mx-auto">
                        Paste a URL or enter a headline. Our AI will analyze it for
                        credibility, clickbait, bias, and more.
                    </p>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="animate-slide-up">
                    <div className="glass-card p-2">
                        <div className="flex items-center gap-2 px-4 py-1">
                            {isUrl ? (
                                <LinkIcon className="w-5 h-5 text-accent-cyan shrink-0" />
                            ) : (
                                <Type className="w-5 h-5 text-text-muted shrink-0" />
                            )}
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Paste a URL or enter a news headline..."
                                className="flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none text-base py-3"
                            />
                            <button
                                type="submit"
                                disabled={!query.trim() || loading}
                                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                            >
                                Analyze
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Example queries */}
                {!result && !loading && !error && (
                    <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                        <span className="text-xs text-text-muted">Try:</span>
                        {[
                            "Breaking: Major earthquake hits California",
                            "Scientists find cure for cancer",
                            "https://example.com/news-article",
                        ].map((example) => (
                            <button
                                key={example}
                                onClick={() => setQuery(example)}
                                className="text-xs text-text-secondary px-3 py-1.5 rounded-full border border-surface-3 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="glass-card-sm p-4 border-accent-rose/30 animate-fade-in">
                        <p className="text-sm text-accent-rose">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && <LoadingSkeleton />}

                {/* Result */}
                {result && !loading && <ResultCard result={result} />}
            </div>
        </div>
    );
}
