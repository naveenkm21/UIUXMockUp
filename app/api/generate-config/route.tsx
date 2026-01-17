import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { userInput, deviceType, projectId, oldScreenDescription, theme } = await req.json();

        console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY);
        console.log('Key includes placeholder:', process.env.OPENROUTER_API_KEY?.includes('<OPENROUTER_API_KEY>'));

        // Check if OpenRouter API key is available and valid
        if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('<OPENROUTER_API_KEY>') || process.env.OPENROUTER_API_KEY === '') {
            console.log('Using mock response - no valid API key');
            // Return mock response when API key is missing
            const mockResponse = {
                projectName: "Mock Project",
                theme: theme || "NETFLIX",
                projectVisualDescription: "A mock UI/UX project for demonstration purposes",
                screens: [
                    {
                        id: "screen1",
                        name: "Home Screen",
                        purpose: "Main landing page",
                        layoutDescription: "A clean home screen with navigation and content sections"
                    }
                ]
            };

            return NextResponse.json(mockResponse);
        }

        // Import only when we have a valid API key
        const { openrouter } = await import("@/config/openroute");
        const { APP_LAYOUT_CONFIG_PROMPT, GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT } = await import("@/data/Prompt");
        const { currentUser } = await import("@clerk/nextjs/server");

        console.log('Using OpenRouter API');
        const stream = await openrouter.chat.send({
            model: "mistralai/devstral-2512:free",
            messages: [
                {
                    role: 'system',
                    content: [
                        {
                            type: 'text',
                            text: oldScreenDescription ?
                                GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT.replace('{deviceType}', deviceType).replace('{theme}', theme) :
                                APP_LAYOUT_CONFIG_PROMPT.replace('{deviceType}', deviceType)
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": oldScreenDescription ? userInput + " Old Screen Description is:" + oldScreenDescription : userInput
                        },
                    ]
                }
            ],
            stream: true,
            streamOptions: {
                includeUsage: true
            }
        });

        let response = "";
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                response += content;
            }

            // Usage information comes in the final chunk
            if (chunk.usage) {
                console.log("Token usage:", chunk.usage);
            }
        }

        console.log('AI Response:', response);

        try {
            const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonStart = cleanedResponse.indexOf('{');
            const jsonEnd = cleanedResponse.lastIndexOf('}');

            let jsonString = cleanedResponse;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
            }

            console.log('Parsing JSON:', jsonString);
            const JSONAiResult = JSON.parse(jsonString);

            if (JSONAiResult) {
                try {
                    // Check if Database is available before trying to save
                    if (!process.env.DATABASE_URL) {
                        throw new Error('Database URL not configured');
                    }

                    const { db } = await import("@/config/db");
                    const { ProjectTable, ScreenConfigTable } = await import("@/config/schema");
                    const { eq } = await import("drizzle-orm");

                    //Update Project Table with Project Name
                    if (!oldScreenDescription) {
                        await db.update(ProjectTable).set({
                            projectVisualDescription: JSONAiResult?.projectVisualDescription,
                            projectName: JSONAiResult?.projectName,
                            theme: JSONAiResult?.theme
                            //@ts-ignore
                        }).where(eq(ProjectTable.projectId, projectId as string));
                    }

                    //Insert Screen Config
                    if (JSONAiResult.screens && Array.isArray(JSONAiResult.screens)) {
                        await Promise.all(JSONAiResult.screens.map(async (screen: any) => {
                            await db.insert(ScreenConfigTable).values({
                                projectId: projectId,
                                purpose: screen?.purpose,
                                screenDescription: screen?.layoutDescription,
                                screenId: screen?.id,
                                screenName: screen?.name
                            });
                        }));
                    }
                } catch (dbError) {
                    console.warn('Database operation failed, returning generated result only:', dbError);
                }

                return NextResponse.json(JSONAiResult);

            } else {
                return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
            }
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Response:', response);
            return NextResponse.json({ error: 'Failed to parse config' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('API Error:', error);

        // Handle Rate Limit (429) specifically
        if (error?.message?.includes('429') || error?.toString().includes('Rate limit') || error?.status === 429) {
            console.warn('Rate limit exceeded. Returning mock response.');
            const mockResponse = {
                projectName: "Mock Project (Rate Limit Reached)",
                theme: "NETFLIX",
                projectVisualDescription: "A mock UI/UX project due to high traffic/rate limits.",
                screens: [
                    {
                        id: "screen1",
                        name: "Home Screen",
                        purpose: "Main landing page",
                        layoutDescription: "A clean home screen with navigation and content sections. Note: This is a placeholder because the AI service is currently busy."
                    }
                ]
            };
            return NextResponse.json(mockResponse);
        }

        return NextResponse.json({ error: 'Failed to generate config' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const projectId = req.nextUrl.searchParams.get('projectId');
        const screenId = req.nextUrl.searchParams.get('screenId');

        const { currentUser } = await import("@clerk/nextjs/server");
        const { db } = await import("@/config/db");
        const { ScreenConfigTable } = await import("@/config/schema");
        const { and, eq } = await import("drizzle-orm");

        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ msg: 'Unauthorized User', status: 400 })
        }

        const result = await db.delete(ScreenConfigTable)
            .where(and(eq(ScreenConfigTable.screenId, screenId as string), eq(ScreenConfigTable.projectId, projectId as string)))

        return NextResponse.json({ msg: 'Deleted' })
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}