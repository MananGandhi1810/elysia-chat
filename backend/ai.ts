import { streamText } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import env from "./env";

const model = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY || "",
})

const chat = (message: string) => {
    return streamText({
        model: model("gemini-2.5-flash"),
        messages: [{ role: "user", content: message }],
    });
};

export { chat };