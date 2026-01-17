import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { projectId, screenId, oldCode, userInput } = await req.json();

        // Check if OpenRouter API key is available and valid
        if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('<OPENROUTER_API_KEY>') || process.env.OPENROUTER_API_KEY === '') {
            // Return mock response when API key is missing
            return NextResponse.json({
                htmlCode: `<div class="p-4 border rounded-lg">Mock edited screen based on: ${userInput}</div>`
            });
        }

        const USER_INPUT = `${oldCode} Make changes as per user Input in this code, Keeping design and style same. 
        Do not change it. Just make user requested changes. and keep all other code as it is. Only return HTML Tailwindcss code and no raw text. UserInput is:  +`+ userInput

        // Import only when we have a valid API key
        const { openrouter } = await import("@/config/openroute");

        const aiResult = await openrouter.chat.send({
            model: "mistralai/devstral-2512:free",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": USER_INPUT
                        },
                    ]
                }
            ],
            stream: false
        });

        let code = aiResult?.choices[0]?.message?.content;
        if (typeof code === 'string') {
            code = code.replace(/```html/g, '').replace(/```jsx/g, '').replace(/```/g, '').trim();
        } else {
            code = String(code);
        }

        try {
            // Check if Database is available
            if (!process.env.DATABASE_URL) {
                throw new Error('Database URL not configured');
            }

            // Import database modules only when needed and safe
            const { db } = await import("@/config/db");
            const { ScreenConfigTable } = await import("@/config/schema");
            const { and, eq } = await import("drizzle-orm");

            const updateResult = await db.update(ScreenConfigTable)
                .set({
                    code: code as string
                }).where(and(eq(ScreenConfigTable.projectId, projectId),
                    eq(ScreenConfigTable?.screenId, screenId as string)))
                .returning();

            return NextResponse.json(updateResult[0]);
        } catch (dbError) {
            console.warn('Database operation failed, returning edited code only:', dbError);
            return NextResponse.json({
                projectId,
                screenId,
                code: code
            });
        }
    }
    catch (e) {
        console.error('Edit Screen Error:', e);
        return NextResponse.json({ error: 'Failed to edit screen' }, { status: 500 });
    }
}