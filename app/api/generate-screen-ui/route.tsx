import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    let projectId, screenId, screenName, purpose, screenDescription, projectVisualDescription;
    try {
        const body = await req.json();
        ({ projectId, screenId, screenName, purpose, screenDescription, projectVisualDescription } = body);

        // Check if OpenRouter API key is available and valid
        if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('<OPENROUTER_API_KEY>') || process.env.OPENROUTER_API_KEY === '') {
            // Return mock response when API key is missing
            return NextResponse.json({
                htmlCode: `<div class="p-4 border rounded-lg"><h2>${screenName}</h2><p>${purpose}</p><p>${screenDescription}</p></div>`
            });
        }

        const userInput = `
        screen Name is: ${screenName},
        screen Purpose: ${purpose},
        screen Description:${screenDescription}
        `

        // Import only when we have a valid API key
        const { openrouter } = await import("@/config/openroute");
        const { GENERATE_SCREEN_PROMPT } = await import("@/data/Prompt");

        const aiResult = await openrouter.chat.send({
            model: "mistralai/devstral-2512:free",
            messages: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'text',
                            text: GENERATE_SCREEN_PROMPT
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": userInput
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

            // Import database modules only when needed
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
            console.warn('Database operation failed, returning generated code only:', dbError);
            return NextResponse.json({
                projectId,
                screenId,
                screenName,
                purpose,
                screenDescription,
                code: code
            });
        }
    }
    catch (e: any) {
        console.error('Generate Screen UI Error:', e);
        console.error('Stack:', e.stack); // Log stack trace

        // Handle Rate Limit (429) specifically
        if (e?.message?.includes('429') || e?.toString().includes('Rate limit') || e?.status === 429) {
            console.warn('Rate limit exceeded. Returning mock UI.');
            return NextResponse.json({
                projectId,
                screenId,
                screenName,
                purpose,
                screenDescription,
                code: `<div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Rate Limit Reached</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        We've hit the daily limit for the free AI model. This is a placeholder screen.
                        <br/><br/>
                        <strong>Title:</strong> ${screenName}
                    </p>
                </div>`
            });
        }
        return NextResponse.json({
            error: 'Failed to generate screen UI',
            details: e instanceof Error ? e.message : String(e)
        }, { status: 500 });
    }
}