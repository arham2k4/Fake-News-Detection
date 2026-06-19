export interface NewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Sanitize a query string so every provider accepts it:
 * - Strip characters that trigger 422s on NewsData
 * - Collapse whitespace
 * - Hard-cap at 128 chars
 */
function sanitizeQuery(query: string): string {
    return query
        .replace(/[^\w\s]/g, " ")   // strip non-word chars (keeps letters, digits, _)
        .replace(/\s+/g, " ")        // collapse whitespace
        .trim()
        .substring(0, 128);
}

/**
 * fetch() with an AbortController-based timeout (default 8 s).
 * Throws on timeout so callers can treat it like any other error.
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = 8_000
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Validate that an env-var API key exists and isn't a placeholder.
 */
function resolveKey(envVar: string, placeholder: string): string | null {
    const key = process.env[envVar];
    if (!key || key === placeholder || key.trim() === "") return null;
    return key.trim();
}

// ─── Provider implementations ──────────────────────────────────────────────────

async function fetchTavilyNews(query: string, maxResults: number, noCache: boolean = false): Promise<NewsArticle[] | null> {
    const apiKey = resolveKey("TAVILY_API_KEY", "your_tavily_key_here");
    if (!apiKey) return null;

    try {
        const url = "https://api.tavily.com/search";
        const options: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "basic",
                max_results: maxResults,
                include_images: true,
            }),
            ...(noCache ? { cache: "no-store" } : { next: { revalidate: 300 } })
        };

        const response = await fetchWithTimeout(url, options, 15000);
        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.error(`[Tavily] HTTP ${response.status}: ${response.statusText} — ${body}`);
            return null;
        }

        const data = await response.json();
        const results = data.results ?? [];
        if (results.length === 0) return null;

        interface TavilyResult {
            title: string;
            url: string;
            content: string;
            published_date?: string;
            image?: string;
        }

        return (results as TavilyResult[]).map((r) => ({
            title: r.title || "",
            description: r.content || "",
            content: r.content || "",
            url: r.url || "",
            image: r.image || null,
            publishedAt: r.published_date || new Date().toISOString(),
            source: {
                name: new URL(r.url).hostname.replace("www.", ""),
                url: r.url
            }
        }));
    } catch (err) {
        console.error(`[Tavily] Failed: ${err}`);
        return null;
    }
}

async function fetchNewsAPI(query: string, maxResults: number, noCache: boolean = false): Promise<NewsArticle[] | null> {
    const apiKey = resolveKey("NEWS_API_KEY", "your_newsapi_key_here");
    if (!apiKey) return null;

    const sanitized = sanitizeQuery(query);
    if (sanitized.length < 3) return null;

    try {
        const url =
            `https://newsapi.org/v2/everything` +
            `?q=${encodeURIComponent(sanitized)}` +
            `&language=en` +
            `&pageSize=${maxResults}` +
            `&sortBy=publishedAt` +
            `&apiKey=${apiKey}`;

        const options: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 300 } };
        const response = await fetchWithTimeout(url, options);

        if (!response.ok) {
            console.error(`[NewsAPI] HTTP ${response.status}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const articles: Record<string, unknown>[] = data.articles ?? [];
        if (articles.length === 0) return null;

        return articles.slice(0, maxResults).map((a) => ({
            title: (a.title as string) ?? "",
            description: (a.description as string) ?? "",
            content: (a.content as string) ?? (a.description as string) ?? "",
            url: (a.url as string) ?? "",
            image: (a.urlToImage as string) ?? null,
            publishedAt: (a.publishedAt as string) ?? "",
            source: {
                name: (a.source as Record<string, string>)?.name ?? "Unknown",
                url: (a.url as string) ?? "",
            },
        }));
    } catch (err) {
        const label = (err as Error).name === "AbortError" ? "timeout" : String(err);
        console.error(`[NewsAPI] Failed: ${label}`);
        return null;
    }
}

async function fetchNewsDataAPI(query: string, maxResults: number, noCache: boolean = false): Promise<NewsArticle[] | null> {
    const apiKey = resolveKey("NEWSDATA_API_KEY", "your_newsdata_key_here");
    if (!apiKey) return null;

    const sanitized = sanitizeQuery(query);
    if (sanitized.length < 3) return null;

    try {
        const url =
            `https://newsdata.io/api/1/latest` +
            `?apikey=${apiKey}` +
            `&q=${encodeURIComponent(sanitized)}` +
            `&language=en` +
            `&size=${maxResults}`;

        const options: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 300 } };
        const response = await fetchWithTimeout(url, options);

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.error(`[NewsData] HTTP ${response.status}: ${response.statusText} — ${body}`);
            return null;
        }

        const data = await response.json();
        const articles: Record<string, unknown>[] = data.results ?? [];
        if (articles.length === 0) return null;

        return articles.slice(0, maxResults).map((a) => ({
            title: (a.title as string) ?? "",
            description: (a.description as string) ?? "",
            content: (a.content as string) ?? (a.description as string) ?? "",
            url: (a.link as string) ?? "",
            image: (a.image_url as string) ?? null,
            publishedAt: (a.pubDate as string) ?? "",
            source: {
                name: (a.source_id as string) ?? "NewsData",
                url: (a.source_url as string) ?? (a.link as string) ?? "",
            },
        }));
    } catch (err) {
        const label = (err as Error).name === "AbortError" ? "timeout" : String(err);
        console.error(`[NewsData] Failed: ${label}`);
        return null;
    }
}

async function fetchFreeNewsAPI(query: string, maxResults: number, noCache: boolean = false): Promise<NewsArticle[] | null> {
    const apiKey = resolveKey("FREENEWS_API_KEY", "your_freenews_key_here");
    if (!apiKey) return null;

    const sanitized = sanitizeQuery(query);
    if (sanitized.length < 3) return null;

    try {
        const url =
            `https://api.freenewsapi.io/v1/news` +
            `?q=${encodeURIComponent(sanitized)}` +
            `&language=en` +
            `&page_size=${maxResults}`;

        const options: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 300 } };
        options.headers = { "x-api-key": apiKey };
        const response = await fetchWithTimeout(url, options);

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.error(`[FreeNewsAPI] HTTP ${response.status}: ${response.statusText} — ${body}`);
            return null;
        }

        const data = await response.json();
        const articles: Record<string, unknown>[] = data.data ?? [];
        if (articles.length === 0) return null;

        return articles.slice(0, maxResults).map((a) => ({
            title: (a.title as string) ?? "",
            description: (a.incipit as string) ?? (a.title as string) ?? "",
            content: (a.incipit as string) ?? (a.title as string) ?? "",
            url: (a.original_url as string) ?? "",
            image: (a.thumbnail as string) ?? null,
            publishedAt: (a.published_at as string) ?? "",
            source: {
                name: (a.publisher as string) ?? "FreeNewsAPI",
                url: (a.original_url as string) ?? "",
            },
        }));
    } catch (err) {
        const label = (err as Error).name === "AbortError" ? "timeout" : String(err);
        console.error(`[FreeNewsAPI] Failed: ${label}`);
        return null;
    }
}

async function fetchPerplexityOpenRouterAPI(query: string, maxResults: number, noCache: boolean = false): Promise<NewsArticle[] | null> {
    const apiKey = resolveKey("OPENROUTER_API_KEY", "your_openrouter_key_here");
    if (!apiKey) return null;

    const sanitized = sanitizeQuery(query);
    if (sanitized.length < 3) return null;

    try {
        const url = `https://openrouter.ai/api/v1/chat/completions`;
        const systemPrompt = `You are an expert news aggregator API. Your job is to search the web and return the latest news articles matching the user's query.
You must return exactly a JSON array of up to ${maxResults} objects, matching this schema:
[
  {
    "title": "Article Title",
    "description": "Brief summary",
    "content": "Brief summary",
    "url": "https://example.com/article",
    "image": "https://example.com/image.jpg",
    "publishedAt": "2024-01-01T00:00:00Z",
    "source": { "name": "Publisher Name", "url": "https://example.com" }
  }
]
Do not include any other text, markdown blocks, or explanation. Just output the raw JSON array. If you cannot find relevant news, return an empty array [].`;

        const options: RequestInit = noCache ? { cache: "no-store" } : { next: { revalidate: 300 } };
        const response = await fetchWithTimeout(
            url,
            {
                ...options,
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "perplexity/llama-3.1-sonar-large-128k-online",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: `Query: ${sanitized}` }
                    ]
                })
            },
            20_000 // Give the LLM more time to perform search
        );

        if (!response.ok) {
            const body = await response.text().catch(() => "");
            console.error(`[Perplexity/OpenRouter] HTTP ${response.status}: ${response.statusText} — ${body}`);
            return null;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || "";
        
        // Strip out markdown code blocks if the LLM adds them despite instructions
        content = content.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();

        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed) || parsed.length === 0) return null;

        return (parsed as NewsArticle[]).slice(0, maxResults).map((a) => ({
            title: a.title ?? "",
            description: a.description ?? "",
            content: a.content ?? a.description ?? "",
            url: a.url ?? "",
            image: a.image ?? null,
            publishedAt: a.publishedAt ?? new Date().toISOString(),
            source: {
                name: a.source?.name ?? "Perplexity Search",
                url: a.source?.url ?? "",
            },
        }));
    } catch (err) {
        const label = (err as Error).name === "AbortError" ? "timeout" : String(err);
        console.error(`[Perplexity/OpenRouter] Failed: ${label}`);
        return null;
    }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Scrape a URL using Jina AI Reader to get clean markdown content.
 */
export async function scrapeArticle(url: string): Promise<string | null> {
    const apiKey = resolveKey("JINA_API_KEY", "your_jina_api_key_here");
    
    try {
        const jinaUrl = `https://r.jina.ai/${url}`;
        const headers: Record<string, string> = {
            "Accept": "application/json"
        };
        
        // Jina Reader works without a key, but having one increases rate limits
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const response = await fetchWithTimeout(jinaUrl, { headers }, 15000);
        if (!response.ok) {
            console.error(`[Jina Reader] HTTP ${response.status}: ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.data?.content || data.data?.text || null;
    } catch (err) {
        console.error(`[Jina Reader] Failed: ${err}`);
        return null;
    }
}

/**
 * Search for news articles with automatic provider fallback.
 *
 * Priority: Tavily → Perplexity (OpenRouter) → FreeNewsAPI → NewsAPI → NewsData
 */
export async function searchArticles(
    query: string,
    maxResults: number = 5,
    noCache: boolean = false
): Promise<NewsArticle[]> {
    const providers: Array<{
        name: string;
        fn: (q: string, n: number, nc: boolean) => Promise<NewsArticle[] | null>;
    }> = [
            { name: "Tavily", fn: fetchTavilyNews },
            { name: "Perplexity", fn: fetchPerplexityOpenRouterAPI },
            { name: "FreeNewsAPI", fn: fetchFreeNewsAPI },
            { name: "NewsAPI", fn: fetchNewsAPI },
            { name: "NewsData", fn: fetchNewsDataAPI },
        ];

    for (const { name, fn } of providers) {
        try {
            const articles = await fn(query, maxResults, noCache);
            if (articles && articles.length > 0) {
                console.log(`[searchArticles] Served by ${name}`);
                return articles;
            }
            console.warn(`[searchArticles] ${name} returned no results — trying next provider`);
        } catch (err) {
            // Defensive: individual fetch helpers already catch, but just in case.
            console.error(`[searchArticles] Unexpected error from ${name}:`, err);
        }
    }

    console.error("[searchArticles] All providers failed — returning []");
    return [];
}