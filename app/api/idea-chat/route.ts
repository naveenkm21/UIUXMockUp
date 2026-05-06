import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are SparkBot 🎨 — a playful, fast-talking UI/UX brainstorming partner inside a mockup-generation tool.

Your job:
- Help users invent fun, viral-style app ideas (e.g. "Spotify for plants", "Tinder for jobs")
- Refine vague prompts into rich, screen-by-screen descriptions the AI image-gen can use
- Suggest 2–3 specific screens, key UI elements, and a vibe/color palette

Style:
- Be SHORT. Max 4 sentences unless they ask for detail.
- Be playful and use a few emojis 🚀✨💡 (not too many)
- When suggesting a polished prompt, wrap it in a markdown code block so the user can copy it
- If the user says "surprise me" or "give me an idea", invent something unexpected and concrete

Never apologize. Never say "as an AI". Just brainstorm like a hyper-creative designer friend.`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('<') || process.env.GROQ_API_KEY === '') {
            return NextResponse.json({ error: 'GROQ_API_KEY is missing' }, { status: 500 });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'messages array required' }, { status: 400 });
        }

        const { groqChat, GROQ_MODELS } = await import("@/config/openroute");

        const result = await groqChat({
            model: process.env.GROQ_IDEA_MODEL || GROQ_MODELS.FAST,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages.slice(-12), // keep last 12 turns
            ],
            temperature: 0.9,
            max_tokens: 400,
        });

        const reply = result?.choices?.[0]?.message?.content?.trim() || "Hmm, brain freeze 🥶 try again?";
        return NextResponse.json({ reply });
    } catch (e: any) {
        console.error('IdeaBot error:', e);
        if (e?.status === 429) {
            return NextResponse.json({ error: 'Slow down a sec 🐢 I hit a rate limit. Try again.' }, { status: 429 });
        }
        return NextResponse.json({ error: 'IdeaBot tripped over a wire' }, { status: 500 });
    }
}
