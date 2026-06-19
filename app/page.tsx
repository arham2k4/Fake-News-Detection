import Link from "next/link";
import {
  MessageSquare,
  Search,
  GitCompareArrows,
  Shield,
  Sparkles,
  Zap,
  Eye,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat Verification",
    description:
      "Chat with our AI to verify news in real-time. Paste URLs, headlines, or ask questions about any news topic.",
    href: "/chat",
    color: "text-accent-cyan",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: Search,
    title: "Check This News",
    description:
      "Get instant credibility scores, detect clickbait, analyze tone, and identify missing sources in any article.",
    href: "/check",
    color: "text-accent-emerald",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: GitCompareArrows,
    title: "Compare Sources",
    description:
      "See how different outlets cover the same story. Compare headlines, tone, bias, and credibility side by side.",
    href: "/compare",
    color: "text-accent-violet",
    gradient: "from-violet-500/20 to-purple-500/20",
  },
];

const stats = [
  { label: "AI Models", value: "LLaMA 3.3" },
  { label: "Analysis Speed", value: "<3s" },
  { label: "Sources Checked", value: "100+" },
  { label: "Cost", value: "Free" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-emerald/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered News Verification
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Separate{" "}
            <span className="gradient-text">Facts</span> from{" "}
            <span className="gradient-text">Fiction</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "100ms" }}>
            TruthLens uses advanced AI to analyze news credibility, detect bias,
            and compare sources — helping you navigate the information landscape
            with confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link
              href="/check"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Search className="w-5 h-5" />
              Check News Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-surface-3 text-text-primary font-semibold text-base hover:bg-surface-2/50 hover:border-accent-cyan/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <MessageSquare className="w-5 h-5" />
              Try AI Chat
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 animate-slide-up" style={{ animationDelay: "300ms" }}>
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card-sm px-4 py-3 text-center">
                <p className="text-lg font-bold gradient-text">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Powerful Tools</span> for News Verification
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Three specialized analysis tools to help you verify any piece of news from any angle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group glass-card p-6 hover:border-accent-cyan/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <span className={`inline-flex items-center gap-1 text-sm font-medium ${feature.color} group-hover:gap-2 transition-all`}>
                    Try it
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-surface-2">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How <span className="gradient-text">TruthLens</span> Works
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Eye,
                title: "Submit Content",
                desc: "Paste a URL, headline, or topic you want to verify.",
              },
              {
                step: "02",
                icon: Zap,
                title: "AI Analysis",
                desc: "Our AI cross-references multiple sources and analyzes credibility signals.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Get Results",
                desc: "Receive a detailed report with scores, explanations, and source comparisons.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 border border-accent-cyan/10">
                    <Icon className="w-7 h-7 text-accent-cyan" />
                  </div>
                  <p className="text-xs font-bold text-accent-cyan tracking-widest">
                    STEP {item.step}
                  </p>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-2 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent-cyan" />
            <span className="font-semibold gradient-text">TruthLens</span>
          </div>
          <p className="text-xs text-text-muted">
            Powered by AI. Built for truth. © {new Date().getFullYear()} TruthLens
          </p>
        </div>
      </footer>
    </div>
  );
}
