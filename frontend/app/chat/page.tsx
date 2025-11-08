"use client";

import { memo, useRef, useEffect, useState } from "react";
import { Bot, Trash2, Send, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useChat } from "./useChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const VoidLogo: React.FC = () => (
  <Zap className="h-5 w-5 text-white fill-white" strokeWidth={2.5} />
);

const LoadingDots: React.FC<{ size: "sm" | "md" }> = ({ size }) => (
  <div className={`flex space-x-1 ${size === "md" ? "p-1" : "p-0.5"}`}>
    <div
      className={`dot ${
        size === "md" ? "w-2 h-2" : "w-1.5 h-1.5"
      } bg-blue-500 rounded-full animate-pulse`}
      style={{ animationDelay: "0s" }}
    ></div>
    <div
      className={`dot ${
        size === "md" ? "w-2 h-2" : "w-1.5 h-1.5"
      } bg-blue-500 rounded-full animate-bounce`}
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className={`dot ${
        size === "md" ? "w-2 h-2" : "w-1.5 h-1.5"
      } bg-blue-500 rounded-full animate-bounce`}
      style={{ animationDelay: "0.4s" }}
    ></div>
  </div>
);

const MarkdownComponents: object = {
  a: (props: any) => (
    <a
      href={props.href}
      className="text-blue-600 hover:underline"
      target={props.href?.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  ),
  p: (props: any) => (
    <p className="mb-4 last:mb-0 text-base leading-relaxed">{props.children}</p>
  ),
  h1: (props: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 border-b pb-1 text-blue-600 dark:text-blue-400">
      {props.children}
    </h1>
  ),
  h2: (props: any) => (
    <h2 className="text-xl font-bold mt-5 mb-2 text-slate-800 dark:text-slate-200">
      {props.children}
    </h2>
  ),
  h3: (props: any) => (
    <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-700 dark:text-slate-300">
      {props.children}
    </h3>
  ),
  ul: (props: any) => (
    <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
      {props.children}
    </ul>
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside ml-4 mb-4 space-y-1">
      {props.children}
    </ol>
  ),
  li: (props: any) => <li className="text-base">{props.children}</li>,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic text-slate-600 dark:text-slate-400 my-4 bg-slate-50 dark:bg-slate-700/50 rounded-r-md">
      {props.children}
    </blockquote>
  ),
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={darcula}
        language={match[1]}
        PreTag="div"
        {...props}
        className="rounded-lg my-3"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
        {...props}
      >
        {children}
      </code>
    );
  },
};

const QuickPrompts: React.FC<{ onPromptSelect: (prompt: string) => void }> = ({
  onPromptSelect,
}) => (
  <div className="text-center p-8 border rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl">
    <Bot className="h-10 w-10 mx-auto text-blue-600 mb-4" />
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
      Welcome to your AI Career Mentor
    </h1>
    <p className="text-slate-500 dark:text-slate-400 mb-6">
      Choose a quick prompt to start — from interview practice to career advice.
    </p>

    <div className="flex flex-wrap justify-center gap-3">
      {/* 💼 Career Guidance */}
      <Button
        variant="secondary"
        onClick={() =>
          onPromptSelect(
            "Suggest the best career path for a Computer Science student interested in AI and Web Development."
          )
        }
      >
        Career Path Guidance
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          onPromptSelect(
            "What skills should I learn to become a Full Stack Developer in 2025?"
          )
        }
      >
        Skill Roadmap 2025
      </Button>

      {/* 🧠 Doubt Solving */}
      <Button
        variant="secondary"
        onClick={() =>
          onPromptSelect(
            "Explain how REST APIs work with a simple real-world example."
          )
        }
      >
        Solve a Technical Doubt
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          onPromptSelect(
            "I'm confused about choosing between React and Next.js — which should I learn and why?"
          )
        }
      >
        Tech Stack Confusion
      </Button>
    </div>
  </div>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
          <VoidLogo />
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-xl shadow-md ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none"
        }`}
      >
        <ReactMarkdown
          components={MarkdownComponents}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {message.content}
        </ReactMarkdown>
        <span
          className={`text-xs mt-2 block ${
            isUser ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold shadow-md">
          U
        </div>
      )}
    </div>
  );
};

const ChatInput: React.FC<{
  onSend: (content: string) => void;
  isLoading: boolean;
}> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent backdrop-blur-3xl border-t  border-slate-200 dark:border-slate-800 shadow-2xl">
      <form
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto p-4 flex gap-3 items-center"
      >
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message..."
          disabled={isLoading}
          className="flex-1 h-12 text-base focus-visible:ring-blue-500 transition"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="h-12 w-12 rounded-full transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

const AIChat = memo(() => {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialScroll, setInitialScroll] = useState(false);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: messages.length > 1 ? "smooth" : "auto",
          block: "end",
        });
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && !initialScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" });
      setInitialScroll(true);
    }
  }, [messages, initialScroll]);

  const lastMessageIndex = messages.length - 1;
  const isLastMessageAssistant =
    messages.length > 0 && messages[lastMessageIndex]?.role === "assistant";

  return (
    <div className="min-h-screen pb-[150px] bg-transparent dark:bg-transparent">
      <div className="relative z-10 flex flex-col min-h-screen max-w-7xl mx-auto">
        <div className="flex-1 backdrop:blur-md mt-20 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 max-w-screen p-4 md:p-6">
            <div className="space-y-6 md:space-y-8">
              {messages.length === 0 ? (
                <QuickPrompts onPromptSelect={sendMessage} />
              ) : (
                <>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 max-w-5xl mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Conversation History
                    </h2>
                    <Button
                      onClick={clearMessages}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear History
                    </Button>
                  </div>
                  <div className="space-y-8 max-w-5xl mx-auto">
                    {messages?.map((message, i) => {
                      const isLastVisibleElement =
                        (i === lastMessageIndex && !isLoading) ||
                        (i === lastMessageIndex && isLastMessageAssistant);

                      return (
                        <div
                          key={message.id || i}
                          ref={isLastVisibleElement ? messagesEndRef : null}
                        >
                          <MessageBubble message={message} />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {isLoading && (
                <div
                  className="flex gap-4 max-w-5xl mx-auto"
                  ref={!isLastMessageAssistant ? messagesEndRef : null}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center">
                    <VoidLogo />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <LoadingDots size="md" />
                      <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                        Neura is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="h-[120px]" />
            </div>
          </ScrollArea>

          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
});

AIChat.displayName = "AIChat";

export default function Page() {
  return <AIChat />;
}
