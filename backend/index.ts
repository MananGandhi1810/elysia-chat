import { Elysia, t } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import env from "./env";
import { chat } from "./ai";

const PORT = env.PORT;

const app = new Elysia({ adapter: node() })
    .use(cors({
        origin: "http://localhost:3001",
        
    }))
    .get("/", () => "Hello, World!")
    .get("/health", () => ({ status: "ok" }))
    .post(
        "/chat",
        ({ body: { messages } }) => {
            return chat(messages).textStream;
        },
        {
            body: t.Object({
                messages: t.Array(
                    t.Object({
                        role: t.Enum({
                            user: "user",
                            assistant: "assistant",
                        }),
                        content: t.String(),
                    })
                ),
            }),
        }
    )
    .listen(PORT, ({ hostname, port }) => {
        console.log(`🦊 Elysia is running at ${hostname}:${port}`);
    });
