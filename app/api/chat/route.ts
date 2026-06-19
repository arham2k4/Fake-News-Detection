import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/app/lib/groq";
import { searchArticles, scrapeArticle, NewsArticle } from "@/app/lib/news";
import { getChatSystemPrompt } from "@/app/lib/prompts";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

function extractQueryForSearch(messages: ChatMessage[]): { query: string | null, url: string | null } {
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user");
    if (!lastUserMessage) return { query: null, url: null };
    
    const content = lastUserMessage.content;

    // Check if it looks like a URL
    const urlMatch = content.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    // Check if it's asking to analyze/check something
    const analyzeMatch = content.match(
        /(?:analyze|check|verify|is this (?:real|fake|true)|fact.check)[:\s]+(.+)/i
    );
    if (analyzeMatch) return { query: analyzeMatch[1].trim(), url };

    // Check if asking for an update or news
    const updateMatch = content.match(
        /(?:update|news|latest|what(?:'s| is) (?:new|happening))(?: on| about| regarding)?[:\s]+(.+)/i
    );
    if (updateMatch) {
        const query = updateMatch[1].trim();
        if (query.toLowerCase() === "this" || query.toLowerCase() === "it") {
            // Find the previous user message to get the topic
            const prevUserMessage = [...messages].reverse().filter(m => m.role === "user")[1];
            if (prevUserMessage) {
                const prevContent = prevUserMessage.content;
                if (prevContent.length < 100) return { query: prevContent, url };
            }
        } else {
            return { query, url };
        }
    }

    // If the message is short enough and looks like a headline
    if (content.length > 15 && content.length < 300 && !content.includes("?")) {
        return { query: content, url };
    }

    return { query: url, url };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Please provide messages." },
                { status: 400 }
            );
        }

        // Get the latest user message
        const lastUserMessage = [...messages]
            .reverse()
            .find((m: ChatMessage) => m.role === "user");

        if (!lastUserMessage) {
            return NextResponse.json(
                { error: "No user message found." },
                { status: 400 }
            );
        }

        // Try to extract a searchable query and URL
        const { query: searchQuery, url: articleUrl } = extractQueryForSearch(messages);

        // Fetch news context if we have a query
        let newsContext = "";
        let articles: NewsArticle[] = [];
        let scrapedContent = "";

        if (articleUrl) {
            scrapedContent = await scrapeArticle(articleUrl) || "";
        }

        if (searchQuery) {
            articles = await searchArticles(searchQuery, 3, true);
            if (articles.length > 0) {
                newsContext = `\n\n[REAL-TIME NEWS CONTEXT for reference]\n${articles
                    .map(
                        (a, i) =>
                            `Source ${i + 1}: ${a.source.name}\nTitle: ${a.title}\nContent: ${a.content?.substring(0, 400) || a.description}`
                    )
                    .join("\n\n")}\n[END NEWS CONTEXT]\n`;
            }
        }

        if (scrapedContent) {
            newsContext += `\n\n[SCRAPED ARTICLE CONTENT]\n${scrapedContent.substring(0, 2000)}\n[END SCRAPED CONTENT]\n`;
        }

        // Build messages for Groq
        const systemMessage = getChatSystemPrompt() + newsContext;

        const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
            { role: "system", content: systemMessage },
            ...messages.slice(-10).map((m: ChatMessage) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
        ];

        const response = await chatCompletion(groqMessages, 0.4);

        return NextResponse.json({ 
            response,
            sources: articles
        });
    } catch (error) {
        console.error("Chat error:", error);

        const message =
            error instanceof Error ? error.message : "Internal server error";

        if (message.includes("GROQ_API_KEY")) {
            return NextResponse.json(
                {
                    response:
                        "⚠️ The Groq API key is not configured. Please add `GROQ_API_KEY` to your `.env.local` file to enable AI analysis.",
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                response:
                    "I encountered an error while processing your request. Please try again.",
            },
            { status: 200 }
        );
    }
}
