"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Shield, Sparkles } from "lucide-react";
import ChatMessage from "../components/ChatMessage";
import { LoadingSpinner } from "../components/LoadingState";
import { NewsArticle } from "@/app/lib/news";

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: NewsArticle[];
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userMessage: Message = { role: "user", content: trimmed };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages.map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response, sources: data.sources },
            ]);
        } catch (_error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "I apologize, but I encountered an error processing your request. Please make sure your API keys are configured in `.env.local` and try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Chat header */}
            <div className="shrink-0 border-b border-surface-2 px-4 sm:px-6 py-3">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-cyan/15 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-accent-cyan" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-text-primary">
                                TruthLens AI
                            </h1>
                            <p className="text-xs text-text-muted">
                                News verification assistant
                            </p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-rose transition-colors px-3 py-1.5 rounded-lg hover:bg-accent-rose/10"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-6 animate-fade-in">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-accent-cyan" />
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-semibold text-text-primary">
                                    How can I help you verify news?
                                </h2>
                                <p className="text-sm text-text-muted max-w-md">
                                    Paste a URL, enter a headline, or ask me about any news topic.
                                    I&apos;ll analyze it for credibility and bias.
                                </p>
                            </div>

                            {/* Suggestions */}
                            <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                                {[
                                    "Is this headline real or fake?",
                                    "Analyze: https://example.com/article",
                                    "What are signs of fake news?",
                                    "Check: 'Scientists discover new species'",
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="text-left text-sm glass-card-sm px-4 py-3 text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} />
                        ))
                    )}

                    {loading && (
                        <LoadingSpinner message="Analyzing and fact-checking..." />
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-surface-2 px-4 sm:px-6 py-4">
                <form
                    onSubmit={handleSubmit}
                    className="max-w-3xl mx-auto"
                >
                    <div className="flex items-end gap-3 glass-card-sm p-2">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Paste a URL, headline, or ask a question..."
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted resize-none outline-none px-3 py-2.5 max-h-32"
                            style={{ minHeight: "40px" }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[11px] text-text-muted text-center mt-2">
                        TruthLens AI may make mistakes. Always verify important claims with
                        official sources.
                    </p>
                </form>
            </div>
        </div>
    );
}
