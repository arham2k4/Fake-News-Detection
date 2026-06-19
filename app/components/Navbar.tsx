"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Shield,
    MessageSquare,
    Search,
    GitCompareArrows,
    Menu,
    X,
} from "lucide-react";

const navLinks = [
    { href: "/", label: "Home", icon: Shield },
    { href: "/chat", label: "AI Chat", icon: MessageSquare },
    { href: "/check", label: "Check News", icon: Search },
    { href: "/compare", label: "Compare", icon: GitCompareArrows },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-card-sm" style={{ borderRadius: 0, borderTop: "none", borderLeft: "none", borderRight: "none" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Shield className="w-8 h-8 text-accent-cyan transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-accent-cyan/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xl font-bold gradient-text">TruthLens</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-accent-cyan/10 text-accent-cyan"
                                            : "text-text-secondary hover:text-text-primary hover:bg-surface-2/50"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-2/50 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        <div className="flex flex-col gap-1">
                            {navLinks.map(({ href, label, icon: Icon }) => {
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? "bg-accent-cyan/10 text-accent-cyan"
                                                : "text-text-secondary hover:text-text-primary hover:bg-surface-2/50"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
