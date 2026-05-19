"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  health_goal?: string;
}

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  recommended_products?: Product[];
}

const renderFormattedText = (text: string) => {
  return text.split("\n").map((line, i) => {
    // split by ** for bold
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          }
          // Highlight *italic* or lists if needed, but for now just text
          return <span key={j}>{part}</span>;
        })}
        <br />
      </span>
    );
  });
};

export function ExpandableChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! I'm an AI health consultant. What health issues are you experiencing, or what product are you looking for?",
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatListRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, setAuthDialogOpen } = useAuthStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthDialogOpen(true);
      return;
    }
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: userMessage,
        sender: "user",
      },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage,
          profile: {
            name: "Khách",
            age: 25,
            allergies: [],
            history: "Bình thường",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: data.answer,
          sender: "ai",
          recommended_products: data.recommended_products,
        },
      ]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content:
            "Xin lỗi, tôi đang gặp sự cố kết nối tới máy chủ. Vui lòng thử lại sau.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachFile = () => {
    //
  };

  const handleMicrophoneClick = () => {
    //
  };

  return (
    <div className="relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={
          <Image
            src={"/chatbot_logo.png"}
            alt="chat"
            height={32}
            width={32}
            className="object-contain"
          />
        }
      >
        <ExpandableChatHeader className="flex-col justify-center text-center">
          <h1 className="text-xl font-semibold">AI Health Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask me anything about health and healthcare products
          </p>
        </ExpandableChatHeader>

        <ExpandableChatBody>
          <ChatMessageList ref={chatListRef}>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={
                    message.sender === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "/chatbot_logo.png"
                  }
                  fallback={message.sender === "user" ? "US" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  <div className="text-sm leading-relaxed break-words">
                    {renderFormattedText(message.content)}
                  </div>

                  {message.recommended_products &&
                    message.recommended_products.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2 border-t pt-3 border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Suggested products
                        </p>
                        <div className="flex flex-col gap-2">
                          {message.recommended_products.map((prod) => (
                            <Link
                              href={`/product/${prod.id}`}
                              key={prod.id}
                              className="bg-background/80 rounded-lg p-3 border shadow-sm flex flex-col gap-1 text-left"
                            >
                              <span className="text-[10px] font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 w-fit px-2 py-0.5 rounded-full">
                                {prod.category}
                              </span>
                              <p className="font-semibold text-foreground text-sm">
                                {prod.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {prod.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src="/chatbot_logo.png"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleAttachFile}
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleMicrophoneClick}
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5 bg-blue-700"
                disabled={isLoading || !input.trim()}
              >
                Gửi
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  );
}
