import Groq from "groq-sdk";

let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === "your_groq_api_key_here") {
            throw new Error("GROQ_API_KEY is not configured. Please add it to .env.local");
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

export async function chatCompletion(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    temperature: number = 0.3
) {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature,
        max_tokens: 2048,
    });
    return completion.choices[0]?.message?.content || "";
}

export async function jsonCompletion(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    temperature: number = 0.2
) {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature,
        max_tokens: 2048,
        response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content || "{}";
    try {
        return JSON.parse(content);
    } catch {
        return { error: "Failed to parse AI response", raw: content };
    }
}
