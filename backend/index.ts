import { Elysia, t } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import env from "./env";
import { chat } from "./ai";
import { openapi } from '@elysiajs/openapi'

const PORT = env.PORT;

const app = new Elysia({ adapter: node() })
    .use(
        cors({
            origin: "http://localhost:3001",
        })
    )
    .use(openapi({
        enabled: env.NODE_ENV !== 'production',
        path: '/openapi',
    }))
    .onError(({ code, status, set }) => {
        if (code === 'NOT_FOUND') {
            set.status = 404;
            return { error: "Not Found" };
        }
    })
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
