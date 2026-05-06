import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Check if Groq API key is available and valid
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('<GROQ_API_KEY>') || process.env.GROQ_API_KEY === '') {
            console.log('Using mock response - no valid Groq API key');
            return NextResponse.json({
                response: "This is a mock response. Please add your GROQ_API_KEY to the .env file to test the actual multimodal functionality."
            });
        }

        const model = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

        // Groq supports text + image (vision). Audio/video URL inputs are not supported in chat completions —
        // for audio use the /audio/transcriptions endpoint separately.
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: "Describe what you see in this image."
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                                }
                            }
                        ]
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Groq API Error:', errorData);
            return NextResponse.json({ error: `Groq API error: ${response.status} ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "No response received";

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process multimodal request' }, { status: 500 });
    }
}
