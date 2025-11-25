import { streamText } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import env from "./env";

const model = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY || "",
});

const chat = (
    messages: { role: "user" | "assistant"; content: string }[] = []
) => {
    return streamText({
        model: model("gemini-2.5-flash"),
        messages,
        system: "You are a helpful assistant. Do not use markdown formatting.",
    });
};

export { chat };
