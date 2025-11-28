"use client";

import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat() {
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const checkSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e as unknown as React.FormEvent);
        }
    }
    
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message;
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "text/event-stream",
                    },
                    body: JSON.stringify({
                        messages: [...messages, { role: "user", content: userMessage }],
                    }),
                }
            );
            
            if (!response.body) {
                setIsLoading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let assistantMessage = "";

            setMessages(prev => [...prev, { role: "assistant", content: "" }]);

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });
                assistantMessage += chunkValue;
                
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "assistant") {
                        lastMessage.content = assistantMessage;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <title>AI Chat</title>
            <meta
                name="description"
                content="An AI chat application built with Elysia, Next.js, Google Gemini and Vercel AI SDK."
            />
            <div className="flex flex-col h-dvh bg-zinc-950 text-zinc-50 font-mono">
                <header className="flex-none border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/10 rounded-none">
                                <Sparkles className="w-5 h-5 text-blue-400" />
                            </div>
                            <h1 className="text-lg font-semibold tracking-tight">
                                AI Chat
                            </h1>
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">
                            Gemini 2.5 Flash
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full w-full">
                        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                                    <div className="p-4 bg-zinc-900 rounded-none">
                                        <Bot className="w-12 h-12 text-zinc-400" />
                                    </div>
                                    <h2 className="text-xl font-medium">How can I help you today?</h2>
                                </div>
                            )}
                            
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-4 ${
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-none bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-5 h-5 text-blue-400" />
                                        </div>
                                    )}
                                    
                                    <div
                                        className={`px-5 py-3.5 max-w-[85%] sm:max-w-[75%] rounded-none shadow-sm ${
                                            msg.role === "user"
                                                ? "bg-white text-zinc-950"
                                                : "bg-zinc-900 text-zinc-100 border border-zinc-800"
                                        }`}
                                    >
                                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </p>
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-none bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex gap-4 justify-start">
                                     <div className="w-8 h-8 rounded-none bg-blue-600/20 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="bg-zinc-900 px-5 py-4 rounded-none border border-zinc-800 flex items-center gap-1">
                                        <div className="w-2 h-2 bg-zinc-500 rounded-none animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-zinc-500 rounded-none animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-zinc-500 rounded-none animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </div>

                <div className="flex-none p-4 bg-zinc-950 border-t border-zinc-800">
                    <div className="max-w-3xl mx-auto">
                        <form  
                            className="relative flex items-end gap-2 bg-zinc-900/50 p-2 rounded-none border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all" 
                            onSubmit={submit}
                        >
                            <Textarea
                                placeholder="Message AI..."
                                className="flex-1 min-h-11 max-h-32 bg-transparent border-none focus-visible:ring-0 text-zinc-100 placeholder:text-zinc-500 resize-none py-3 px-3"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={checkSubmit}
                                autoFocus
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="mb-0.5 rounded-none bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                disabled={!message.trim() || isLoading}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-zinc-600">
                                AI can make mistakes. Check important info.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
