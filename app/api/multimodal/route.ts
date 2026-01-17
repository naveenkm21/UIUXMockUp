import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY);
        console.log('Key includes placeholder:', process.env.OPENROUTER_API_KEY?.includes('<OPENROUTER_API_KEY>'));

        // Check if OpenRouter API key is available and valid
        if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes('<OPENROUTER_API_KEY>') || process.env.OPENROUTER_API_KEY === '') {
            console.log('Using mock response - no valid API key');
            // Return mock response when API key is missing
            const mockResponse = {
                response: "This is a mock response. Please add your OpenRouter API key to the .env file to test the actual multimodal functionality. The API would analyze: 1) A nature boardwalk image, 2) Audio data, and 3) A YouTube video."
            };

            return NextResponse.json(mockResponse);
        }

        // Use direct HTTP request to OpenRouter API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "UI/UX Mockup Multimodal Test"
            },
            body: JSON.stringify({
                model: "mistralai/devstral-2512:free",
                messages: [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "What is in this image, audio and video?"
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                                }
                            },
                            {
                                "type": "input_audio",
                                "input_audio": {
                                    "data": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB",
                                    "format": "wav"
                                }
                            },
                            {
                                "type": "video_url",
                                "video_url": {
                                    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
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
            console.error('OpenRouter API Error:', errorData);
            return NextResponse.json({ error: `OpenRouter API error: ${response.status} ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "No response received";

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to process multimodal request' }, { status: 500 });
    }
}
