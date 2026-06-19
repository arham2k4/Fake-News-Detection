"use client";

import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { NewsArticle } from "@/app/lib/news";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    sources?: NewsArticle[];
}

export default function ChatMessage({ role, content, sources }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <div
            className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"
                }`}
        >
            {/* Avatar */}
            <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
                        ? "bg-accent-violet/20 text-accent-violet"
                        : "bg-accent-cyan/20 text-accent-cyan"
                    }`}
            >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                        ? "bg-accent-violet/15 border border-accent-violet/20 text-text-primary"
                        : "glass-card-sm text-text-primary"
                    }`}
            >
                {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="prose-dark text-sm">
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                        {sources && sources.length > 0 && (
                            <div className="mt-2 pt-3 border-t border-surface-3">
                                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                                    Sources Used
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {sources.map((src, i) => {
                                        let domain = "";
                                        try {
                                            domain = new URL(src.url).hostname;
                                        } catch (_e) {
                                            domain = "example.com";
                                        }
                                        return (
                                            <a
                                                key={i}
                                                href={src.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-surface-3 hover:border-accent-cyan/40 hover:bg-surface-3 transition-colors text-xs text-text-secondary"
                                                title={src.title}
                                            >
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                                    alt={src.source?.name || domain}
                                                    className="w-4 h-4 rounded-sm"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                                                    }}
                                                />
                                                <span className="max-w-[150px] truncate font-medium">
                                                    {src.source?.name || domain}
                                                </span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
