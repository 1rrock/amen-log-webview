import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;
if (apiKey) {
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
}

export interface AIResponse {
    book: string;
    chapter: number;
    verse: number;
    verseText: string;
    guidance: string;
}

export const generateResponse = async (prayer: string): Promise<AIResponse> => {
    if (!openai) {
        throw new Error("OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
    }

    const systemPrompt = import.meta.env.VITE_OPENAI_SYSTEM_PROMPT ||
        "You are a devout Bible assistant. Return JSON with 'book', 'chapter', 'verse', 'verseText', and 'guidance'. Ensure valid JSON output.";

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                { role: "user", content: prayer }
            ],
            model: "gpt-4o-mini",
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (content) {
            return JSON.parse(content) as AIResponse;
        }
        throw new Error("응답을 받지 못했습니다.");
    } catch (error) {
        console.error("OpenAI API 호출 실패:", error);
        throw error;
    }
};
