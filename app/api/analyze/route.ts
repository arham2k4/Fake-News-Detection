import { NextRequest, NextResponse } from "next/server";
import { jsonCompletion } from "@/app/lib/groq";
import { searchArticles, scrapeArticle } from "@/app/lib/news";
import { getAnalysisPrompt } from "@/app/lib/prompts";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query || typeof query !== "string" || query.trim().length === 0) {
            return NextResponse.json(
                { error: "Please provide a news headline or URL to analyze." },
                { status: 400 }
            );
        }

        const trimmedQuery = query.trim();
        let analysisInput = trimmedQuery;
        
        // If query is a URL, scrape it first
        if (trimmedQuery.startsWith("http")) {
            const scraped = await scrapeArticle(trimmedQuery);
            if (scraped) {
                analysisInput = scraped;
            }
        }

        // Fetch related articles for context
        const articles = await searchArticles(trimmedQuery, 5, true);

        if (articles.length === 0 && !trimmedQuery.startsWith("http")) {
            return NextResponse.json(
                { error: "No recent news articles found for this query. Try adjusting your search." },
                { status: 404 }
            );
        }

        // Build structured prompt
        const prompt = getAnalysisPrompt(analysisInput, articles);

        // Get AI analysis
        const result = await jsonCompletion([
            {
                role: "system",
                content:
                    "You are TruthLens, an expert AI news fact-checker. Always respond with valid JSON matching the exact schema requested.",
            },
            { role: "user", content: prompt },
        ]);

        // Ensure required fields have defaults
        const response = {
            credibility_score: result.credibility_score ?? 50,
            classification: result.classification ?? "Unverified",
            summary: result.summary ?? "Unable to determine summary.",
            explanation: result.explanation ?? "Analysis could not be completed.",
            tone_analysis: result.tone_analysis ?? null,
            bias_indicators: result.bias_indicators ?? [],
            issues: result.issues ?? [],
            sources: result.sources ?? articles.map((a) => a.source.name),
            missing_context: result.missing_context ?? null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Analysis error:", error);

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
