import { NextRequest, NextResponse } from "next/server";

const extractTextContent = (content: unknown): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((part: any) => {
                if (typeof part === 'string') return part;
                if (part?.type === 'text' && typeof part?.text === 'string') return part.text;
                return '';
            })
            .join('')
            .trim();
    }
    if (content && typeof content === 'object' && 'text' in (content as any)) {
        const text = (content as any).text;
        return typeof text === 'string' ? text : '';
    }
    return '';
};

export async function POST(req: NextRequest) {
    try {
        const { userInput, deviceType, projectId, oldScreenDescription, theme } = await req.json();

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('<') || process.env.GROQ_API_KEY === '') {
            return NextResponse.json({ error: 'GROQ_API_KEY is missing or invalid' }, { status: 500 });
        }

        const { groqChat, GROQ_MODELS } = await import("@/config/openroute");
        const { APP_LAYOUT_CONFIG_PROMPT, GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT } = await import("@/data/Prompt");

        const systemPrompt = oldScreenDescription
            ? GENRATE_NEW_SCREEN_IN_EXISITING_PROJECT_PROJECT.replace('{deviceType}', deviceType).replace('{theme}', theme)
            : APP_LAYOUT_CONFIG_PROMPT.replace('{deviceType}', deviceType);

        const strictJsonInstruction = `\n\nReturn ONLY valid JSON. No markdown, no explanations. JSON shape must be:\n{\n  "projectName": "string",\n  "theme": "string",\n  "projectVisualDescription": "string",\n  "screens": [\n    {\n      "id": "string",\n      "name": "string",\n      "purpose": "string",\n      "layoutDescription": "string"\n    }\n  ]\n}`;

        const userPrompt = oldScreenDescription
            ? `${userInput ?? ''} Old Screen Description is:${oldScreenDescription ?? ''}`.trim()
            : (userInput ?? '');

        const envModels = process.env.GROQ_CONFIG_MODELS
            ? process.env.GROQ_CONFIG_MODELS.split(',').map(m => m.trim()).filter(Boolean)
            : [];

        const modelCandidates = [
            ...envModels,
            process.env.GROQ_CONFIG_MODEL,
            GROQ_MODELS.TEXT,
            "llama-3.1-8b-instant",
            "gemma2-9b-it",
        ].filter(Boolean) as string[];

        let response = "";
        let lastModelError: unknown;

        for (const model of modelCandidates) {
            try {
                const aiResult = await groqChat({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt + strictJsonInstruction },
                        { role: 'user', content: userPrompt },
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.5,
                });
                const content = aiResult?.choices?.[0]?.message?.content;
                response = extractTextContent(content);
                if (response) break;
            } catch (modelError) {
                lastModelError = modelError;
            }
        }

        if (!response) {
            console.error('Model response was empty:', lastModelError);
            return NextResponse.json({ error: 'Model returned empty response' }, { status: 502 });
        }

        try {
            const cleanedResponse = response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const jsonStart = cleanedResponse.indexOf('{');
            const jsonEnd = cleanedResponse.lastIndexOf('}');

            let jsonString = cleanedResponse;
            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
            }

            let JSONAiResult: any;
            try {
                JSONAiResult = JSON.parse(jsonString);
            } catch {
                const repairModel = modelCandidates[0] || GROQ_MODELS.TEXT;
                const repairResult = await groqChat({
                    model: repairModel,
                    messages: [
                        {
                            role: 'system',
                            content: 'Convert the user input into strictly valid JSON only. Output only JSON object with keys: projectName, theme, projectVisualDescription, screens[].id, screens[].name, screens[].purpose, screens[].layoutDescription'
                        },
                        { role: 'user', content: jsonString },
                    ],
                    response_format: { type: 'json_object' },
                });
                const repairedRaw = extractTextContent(repairResult?.choices?.[0]?.message?.content)
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                const repairedStart = repairedRaw.indexOf('{');
                const repairedEnd = repairedRaw.lastIndexOf('}');
                const repairedJson = (repairedStart !== -1 && repairedEnd !== -1)
                    ? repairedRaw.substring(repairedStart, repairedEnd + 1)
                    : repairedRaw;
                JSONAiResult = JSON.parse(repairedJson);
            }

            if (!JSONAiResult?.projectName || !Array.isArray(JSONAiResult?.screens)) {
                return NextResponse.json({ error: 'Invalid AI response shape' }, { status: 502 });
            }

            try {
                if (!process.env.DATABASE_URL) {
                    throw new Error('Database URL not configured');
                }
                const { db } = await import("@/config/db");
                const { ProjectTable, ScreenConfigTable } = await import("@/config/schema");
                const { eq } = await import("drizzle-orm");

                if (!oldScreenDescription) {
                    await db.update(ProjectTable).set({
                        projectVisualDescription: JSONAiResult?.projectVisualDescription,
                        projectName: JSONAiResult?.projectName,
                        theme: JSONAiResult?.theme,
                        //@ts-ignore
                    }).where(eq(ProjectTable.projectId, projectId as string));
                }

                if (Array.isArray(JSONAiResult.screens)) {
                    const screensToInsert = JSONAiResult.screens.map((screen: any) => ({
                        projectId,
                        purpose: screen?.purpose,
                        screenDescription: screen?.layoutDescription,
                        screenId: screen?.id,
                        screenName: screen?.name,
                    }));
                    if (screensToInsert.length > 0) {
                        await db.insert(ScreenConfigTable).values(screensToInsert);
                    }
                }
            } catch (dbError) {
                console.warn('Database operation failed, returning generated result only:', dbError);
            }

            return NextResponse.json(JSONAiResult);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Response:', response);
            return NextResponse.json({ error: 'Failed to parse config from AI response' }, { status: 502 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        if (error?.message?.includes('429') || error?.toString().includes('Rate limit') || error?.status === 429) {
            return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a moment.' }, { status: 429 });
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
            return NextResponse.json({ msg: 'Unauthorized User', status: 400 });
        }

        await db.delete(ScreenConfigTable)
            .where(and(eq(ScreenConfigTable.screenId, screenId as string), eq(ScreenConfigTable.projectId, projectId as string)));

        return NextResponse.json({ msg: 'Deleted' });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
