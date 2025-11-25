"use client";

import { Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function Chat() {
    const [messages, setMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [message, setMessage] = useState("");

    const checkSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e as unknown as React.FormEvent);
        }
    }
    
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: message }]);
        setMessage("");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: message }],
                }),
            }
        );
        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let assistantMessage = "";

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value);
            assistantMessage += chunkValue;
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                    return [
                        ...prev.slice(0, -1),
                        { role: "assistant", content: assistantMessage },
                    ];
                } else {
                    return [
                        ...prev,
                        { role: "assistant", content: assistantMessage },
                    ];
                }
            });
        }
    };

    return (
        <div className="bg-black text-white h-screen flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col h-full">
                <div className="text-center py-4 border-b border-gray-800 mb-4">
                    <h1 className="text-xl font-semibold tracking-tight">AI Chat</h1>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 px-2 pb-4 scrollbar-thin scrollbar-thumb-gray-700">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Start a conversation...</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`px-4 py-3 rounded-2xl max-w-[75%] ${
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-gray-800 text-gray-100 rounded-bl-sm"
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <form className="flex gap-3 pt-4 border-t border-gray-800" onSubmit={submit}>
                    <Textarea
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-900 border-gray-700 focus:border-blue-500 text-white placeholder:text-gray-500 rounded-xl px-4 py-3"
                        value={message}
                        rows={1}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={checkSubmit}
                        autoFocus
                    />
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4 transition-colors"
                        disabled={!message.trim()}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
