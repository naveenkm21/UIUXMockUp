import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let projectId, screenId, screenName, purpose, screenDescription;
    try {
        const body = await req.json();
        ({ projectId, screenId, screenName, purpose, screenDescription } = body);

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('<') || process.env.GROQ_API_KEY === '') {
            return NextResponse.json({ error: 'GROQ_API_KEY is missing or invalid' }, { status: 500 });
        }

        const userInput = `
        screen Name is: ${screenName},
        screen Purpose: ${purpose},
        screen Description:${screenDescription}
        `;

        const { groqStream, GROQ_MODELS } = await import("@/config/openroute");
        const { GENERATE_SCREEN_PROMPT } = await import("@/data/Prompt");

        const model = process.env.GROQ_UI_MODEL || GROQ_MODELS.CODE;

        let code = "";
        for await (const delta of groqStream({
            model,
            messages: [
                { role: "system", content: GENERATE_SCREEN_PROMPT },
                { role: "user", content: userInput },
            ],
            max_tokens: 3000,
            temperature: 0.6,
        })) {
            code += delta;
        }

        if (!code) {
            return NextResponse.json({ error: 'Failed to generate screen code from model' }, { status: 502 });
        }

        try {
            if (!process.env.DATABASE_URL) {
                throw new Error('Database URL not configured');
            }

            const { db } = await import("@/config/db");
            const { ScreenConfigTable } = await import("@/config/schema");
            const { and, eq } = await import("drizzle-orm");

            const updateResult = await db.update(ScreenConfigTable)
                .set({ code: code as string })
                .where(and(eq(ScreenConfigTable.projectId, projectId),
                    eq(ScreenConfigTable?.screenId, screenId as string)))
                .returning();

            return NextResponse.json(updateResult[0]);
        } catch (dbError) {
            console.warn('Database operation failed, returning generated code only:', dbError);
            return NextResponse.json({
                projectId,
                screenId,
                screenName,
                purpose,
                screenDescription,
                code,
            });
        }
    }
    catch (e: any) {
        console.error('Generate Screen UI Error:', e);
        if (e?.message?.includes('429') || e?.toString().includes('Rate limit') || e?.status === 429) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a moment.' }, { status: 429 });
        }
        return NextResponse.json({
            error: 'Failed to generate screen UI',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 });
    }
}
