"use client";

import { Loader2, Shield } from "lucide-react";

interface LoadingStateProps {
    message?: string;
    type?: "spinner" | "skeleton";
}

export function LoadingSpinner({ message = "Analyzing..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 animate-fade-in">
            <div className="relative">
                <Loader2 className="w-10 h-10 text-accent-cyan animate-spin" />
                <div className="absolute inset-0 bg-accent-cyan/20 rounded-full blur-xl" />
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Shield className="w-4 h-4 text-accent-cyan animate-pulse" />
                {message}
            </div>
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="glass-card p-6 space-y-6 animate-fade-in">
            {/* Header skeleton */}
            <div className="flex items-center gap-6">
                <div className="w-[140px] h-[140px] rounded-full shimmer-bg" />
                <div className="flex-1 space-y-3">
                    <div className="w-32 h-8 rounded-full shimmer-bg" />
                    <div className="w-full h-4 rounded shimmer-bg" />
                    <div className="w-3/4 h-4 rounded shimmer-bg" />
                </div>
            </div>

            {/* Body skeleton */}
            <div className="space-y-3">
                <div className="w-40 h-5 rounded shimmer-bg" />
                <div className="w-full h-4 rounded shimmer-bg" />
                <div className="w-full h-4 rounded shimmer-bg" />
                <div className="w-2/3 h-4 rounded shimmer-bg" />
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2">
                <div className="w-20 h-7 rounded-full shimmer-bg" />
                <div className="w-24 h-7 rounded-full shimmer-bg" />
                <div className="w-16 h-7 rounded-full shimmer-bg" />
            </div>
        </div>
    );
}

export default function LoadingState({ message, type = "spinner" }: LoadingStateProps) {
    if (type === "skeleton") return <LoadingSkeleton />;
    return <LoadingSpinner message={message} />;
}
