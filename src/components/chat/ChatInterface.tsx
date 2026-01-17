"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { chatWithDataAction, getChatHistoryAction } from "@/app/chat-actions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Message = {
    role: "user" | "model";
    text: string;
    createdAt?: string;
};

interface ChatInterfaceProps {
    variant?: "widget" | "full";
}

export function ChatInterface({ variant = "widget" }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false); // Sending message
    const [initializing, setInitializing] = useState(true); // Initial load
    const [historyLoading, setHistoryLoading] = useState(false); // Loading older
    const [hasMore, setHasMore] = useState(true);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Fetch Initial History
    useEffect(() => {
        async function loadHistory() {
            try {
                const res = await getChatHistoryAction(10); // Initial batch
                if (res.success && res.messages) {
                    if (res.messages.length > 0) {
                        // @ts-ignore
                        setMessages(res.messages.map((m) => ({
                            role: m.role,
                            text: m.content,
                            createdAt: m.createdAt
                        })));
                    } else {
                        // Default greeting
                        setMessages([
                            {
                                role: "model",
                                text: "Hi! I'm Enzo, your AI Career Copilot. Ask me anything about your professional history.",
                                createdAt: new Date().toISOString()
                            },
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history", error);
            } finally {
                setInitializing(false);
            }
        }
        loadHistory();
    }, []);

    // 1. Initial Scroll to Bottom (Instant)
    useEffect(() => {
        if (!initializing && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }
    }, [initializing]); // Only run when initialization finishes

    // 2. Scroll on New User Message (Smooth)
    useEffect(() => {
        if (loading) {
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            });
        }
    }, [messages, loading]);

    // Handle Infinite Scroll
    const handleScroll = async () => {
        const container = scrollContainerRef.current;
        if (!container || historyLoading || !hasMore || initializing) return;

        // Threshold to load more (top of scroll)
        if (container.scrollTop < 50) {
            setHistoryLoading(true);
            const currentScrollHeight = container.scrollHeight;
            const oldestMessage = messages[0];

            if (!oldestMessage?.createdAt) {
                setHistoryLoading(false);
                return;
            }

            try {
                // Fetch older messages before the oldest one
                const res = await getChatHistoryAction(20, oldestMessage.createdAt);

                if (res.success && res.messages && res.messages.length > 0) {
                    const newMessages = res.messages.map((m: any) => ({
                        role: m.role,
                        text: m.content,
                        createdAt: m.createdAt
                    }));

                    setMessages((prev) => [...newMessages, ...prev]);

                    // Restore Scroll Position
                    // We need to wait for DOM update to adjust scroll
                    requestAnimationFrame(() => {
                        if (scrollContainerRef.current) {
                            const newScrollHeight = scrollContainerRef.current.scrollHeight;
                            scrollContainerRef.current.scrollTop = newScrollHeight - currentScrollHeight;
                        }
                    });

                } else {
                    setHasMore(false); // No more history
                }
            } catch (err) {
                console.error("Failed to load older messages", err);
            } finally {
                setHistoryLoading(false);
            }
        }
    };

    const adjustHeight = () => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        }
    };

    // Reset height on input clear
    useEffect(() => {
        if (!input && inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", text: userMsg, createdAt: new Date().toISOString() }]);
        setLoading(true);

        try {
            // Convert history to API format
            const apiHistory = messages.map((m) => ({
                role: m.role,
                parts: m.text,
            }));

            const result = await chatWithDataAction(userMsg, apiHistory);

            if (result.success) {
                setMessages((prev) => [
                    ...prev,
                    { role: "model", text: result.response || "No response generated.", createdAt: new Date().toISOString() },
                ]);
            } else {
                toast.error(result.error || "Failed to get response");
                setMessages((prev) => [
                    ...prev,
                    { role: "model", text: "⚠️ Error: " + (result.error || "Unknown error"), createdAt: new Date().toISOString() },
                ]);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isFull = variant === "full";

    return (
        <div className={`flex flex-col h-full ${isFull ? "bg-transparent" : "bg-[var(--bg-secondary)]"}`}>
            {/* Messages */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent scroll-smooth"
            >
                {/* Loading Indicator for Old History */}
                {historyLoading && (
                    <div className="flex justify-center py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                )}

                {initializing ? (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading history...</span>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user"
                                        ? "bg-[var(--accent-cyan)] text-white rounded-tr-sm"
                                        : "bg-[var(--bg-primary)] border border-black/5 rounded-tl-sm prose prose-sm prose-invert shadow-sm dark:bg-zinc-900"
                                        } ${isFull ? "px-5 py-4 text-base" : ""}`}
                                >
                                    {msg.role === "user" ? (
                                        msg.text
                                    ) : (
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--bg-primary)] border border-black/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                            <span className="text-xs text-[var(--text-muted)]">
                                Thinking...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className={`p-3 bg-[var(--bg-primary)] border-t border-black/5 ${isFull ? "border-none bg-transparent" : "rounded-b-2xl"}`}>
                <div className={`relative w-full mx-auto ${isFull ? "max-w-6xl" : ""}`}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your career..."
                        className={`w-full bg-[var(--bg-secondary)] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 focus:ring-1 focus:ring-[var(--accent-cyan)] focus:border-[var(--accent-cyan)] resize-none ${isFull ? "text-base py-4 shadow-sm" : "text-sm max-h-32"}`}
                        rows={1}
                        style={{ overflow: 'hidden' }} // Hide scrollbar if auto-expanding
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`absolute right-2 p-1.5 bg-[var(--accent-cyan)] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed ${isFull ? "bottom-3.5" : "bottom-2"}`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                {!isFull && (
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-[var(--text-muted)]">
                            Using Function Calling & Embeddings • Usage Based Pricing
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
