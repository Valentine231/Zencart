import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const { messages, status, sendMessage } = useChat({
  transport: new DefaultChatTransport({ api: "/api/chat" }),
});
