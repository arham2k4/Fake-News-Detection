import { NextRequest, NextResponse } from "next/server";
import { jsonCompletion } from "@/app/lib/groq";
import { searchArticles } from "@/app/lib/news";
import { getComparisonPrompt } from "@/app/lib/prompts";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic } = body;

        if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
            return NextResponse.json(
                { error: "Please provide a topic to compare." },
                { status: 400 }
            );
        }

        const trimmedTopic = topic.trim();

        // Fetch articles on the topic
        const articles = await searchArticles(trimmedTopic, 5, true);

        if (articles.length === 0) {
            return NextResponse.json(
                { error: "No articles found for this topic. Try a different search term." },
                { status: 404 }
            );
        }

        // Build comparison prompt
        const prompt = getComparisonPrompt(trimmedTopic, articles);

        // Get AI comparison
        const result = await jsonCompletion([
            {
                role: "system",
                content:
                    "You are TruthLens, an expert media analyst. Respond with valid JSON matching the exact schema requested. Provide insightful, balanced analysis.",
            },
            { role: "user", content: prompt },
        ]);

        // Ensure required fields have defaults
        const response = {
            topic_summary: result.topic_summary ?? `Coverage analysis for: ${trimmedTopic}`,
            articles: (result.articles ?? []).map(
                (article: Record<string, unknown>, i: number) => ({
                    source: article.source ?? articles[i]?.source?.name ?? `Source ${i + 1}`,
                    headline: article.headline ?? articles[i]?.title ?? "Unknown headline",
                    tone: article.tone ?? "Neutral",
                    bias: article.bias ?? "None",
                    key_emphasis: article.key_emphasis ?? "General coverage",
                    credibility_score: article.credibility_score ?? 50,
                    notable_omissions: article.notable_omissions ?? "None",
                    url: articles[i]?.url || "",
                })
            ),
            overall_assessment:
                result.overall_assessment ?? "Analysis could not be completed fully.",
            consensus_points: result.consensus_points ?? [],
            divergence_points: result.divergence_points ?? [],
            recommendation: result.recommendation ?? "",
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Compare error:", error);

        const message =
            error instanceof Error ? error.message : "Internal server error";

        if (message.includes("GROQ_API_KEY")) {
            return NextResponse.json(
                { error: "Groq API key is not configured. Please add GROQ_API_KEY to .env.local" },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
