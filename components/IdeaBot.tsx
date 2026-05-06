"use client";
import React, { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Wand2, Copy, Check } from "lucide-react";
import axios from "axios";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
    "Surprise me with a wild app idea ✨",
    "Refine my prompt into something better",
    "Give me 3 ideas for a fitness app",
    "What screens should a finance app have?",
];

interface Props {
    onUseIdea?: (prompt: string) => void;
}

export default function IdeaBot({ onUseIdea }: Props) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [pulse, setPulse] = useState(true);
    const [messages, setMessages] = useState<Msg[]>([
        {
            role: "assistant",
            content: "Hey! I'm **SparkBot** ✨ tell me what you're building and I'll spark up some ideas — or just say *surprise me*!",
        },
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) setPulse(false);
    }, [open]);

    const send = async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content || loading) return;

        const next: Msg[] = [...messages, { role: "user", content }];
        setMessages(next);
        setInput("");
        setLoading(true);

        try {
            const res = await axios.post("/api/idea-chat", { messages: next });
            setMessages([...next, { role: "assistant", content: res.data.reply }]);
        } catch (e: any) {
            const errMsg = e?.response?.data?.error || "Oops, my circuits crossed 🤖💔";
            setMessages([...next, { role: "assistant", content: errMsg }]);
        } finally {
            setLoading(false);
        }
    };

    // Extract code blocks from assistant message — those are the polished prompts
    const extractPrompts = (text: string): string[] => {
        const matches = text.match(/```(?:[a-z]*\n)?([\s\S]+?)```/g) || [];
        return matches.map((m) => m.replace(/```[a-z]*\n?/, "").replace(/```$/, "").trim());
    };

    const useIdea = (prompt: string) => {
        if (onUseIdea) {
            onUseIdea(prompt);
            setOpen(false);
        } else {
            // fallback: dispatch event for any listener
            window.dispatchEvent(new CustomEvent("sparkbot-use-idea", { detail: prompt }));
        }
    };

    const copy = async (text: string, idx: number) => {
        await navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1500);
    };

    // Render markdown-ish bold + code blocks
    const renderContent = (text: string, msgIdx: number) => {
        const parts = text.split(/(```[\s\S]*?```)/g);
        return parts.map((part, i) => {
            const codeMatch = part.match(/^```(?:[a-z]*\n)?([\s\S]+?)```$/);
            if (codeMatch) {
                const code = codeMatch[1].trim();
                const ideaIdx = msgIdx * 100 + i;
                return (
                    <div key={i} className="my-2 rounded-lg border border-purple-200 bg-purple-50 p-2.5 relative group">
                        <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap pr-1">{code}</p>
                        <div className="flex gap-1.5 mt-2">
                            <button
                                onClick={() => useIdea(code)}
                                className="flex-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1"
                            >
                                <Wand2 size={11} /> Use this idea
                            </button>
                            <button
                                onClick={() => copy(code, ideaIdx)}
                                className="text-[11px] px-2 py-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                title="Copy"
                            >
                                {copiedIdx === ideaIdx ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                            </button>
                        </div>
                    </div>
                );
            }
            // bold support
            const segs = part.split(/(\*\*[^*]+\*\*)/g);
            return (
                <span key={i}>
                    {segs.map((s, j) =>
                        s.startsWith("**") && s.endsWith("**") ? (
                            <strong key={j}>{s.slice(2, -2)}</strong>
                        ) : (
                            <span key={j}>{s}</span>
                        )
                    )}
                </span>
            );
        });
    };

    return (
        <>
            {/* Launcher */}
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Open SparkBot"
                className={`fixed bottom-6 right-6 z-[120] w-14 h-14 rounded-full
                    bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400
                    text-white shadow-lg hover:shadow-xl transition-all
                    flex items-center justify-center group
                    ${open ? "rotate-90 scale-95" : "hover:scale-110"}`}
            >
                {open ? <X size={22} /> : <Sparkles size={22} className="animate-pulse" />}
                {!open && pulse && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-400 rounded-full border-2 border-white animate-ping" />
                )}
                {!open && (
                    <span className="absolute right-full mr-3 px-3 py-1.5 bg-black text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Need ideas? ✨
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div
                    className="fixed bottom-24 right-4 sm:right-6 z-[115]
                        w-[calc(100vw-2rem)] sm:w-[400px] h-[560px]
                        rounded-3xl overflow-hidden flex flex-col
                        bg-white shadow-2xl border border-gray-200
                        animate-in slide-in-from-bottom-4 fade-in duration-300"
                >
                    {/* Header */}
                    <div className="px-4 py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Sparkles size={18} />
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-sm">SparkBot</h3>
                                <p className="text-[11px] text-white/80">Your idea sidekick · always brainstorming</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-purple-50/30 to-pink-50/30">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                                {m.role === "assistant" && (
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                        <Sparkles size={13} />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        m.role === "user"
                                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm"
                                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                                    }`}
                                >
                                    {renderContent(m.content, i)}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                    <Sparkles size={13} />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
                                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
                                </div>
                            </div>
                        )}

                        {/* Quick starters (only show when conversation is fresh) */}
                        {messages.length === 1 && !loading && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {STARTERS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 p-3 bg-white">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                                placeholder="Spark an idea..."
                                disabled={loading}
                                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => send()}
                                disabled={loading || !input.trim()}
                                className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">Powered by Groq · Llama 3.1</p>
                    </div>
                </div>
            )}
        </>
    );
}
