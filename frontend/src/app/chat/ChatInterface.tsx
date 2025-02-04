"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { marked } from "marked";
import { SidebarTrigger } from "@/components/ui/sidebar";
import styles from "./index.module.css";

// Message interface to handle chat messages
interface Message {
  id: string;
  message: string;
  sender: "user" | "bot";
}

// Props for the InputContainer component
interface InputContainerProps {
  rowSize: number;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDownInput: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  userMessage: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  sendMessage: () => void;
  charCount: number;
  isResponseStreaming: boolean;
  characterLimit: number;
  chatStarted: boolean;
  sendBtnRef: RefObject<HTMLButtonElement | null>;
}

// Props for the Footer component
interface FooterProps {
  footerRef: RefObject<HTMLDivElement | null>;
}

export function ChatInterface({}) {
  const [chatStarted, setChatStarted] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponseAwaiting, setisResponseAwaiting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [characterLimit] = useState(10000);
  const [isResponseStreaming, setisResponseStreaming] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Refs for managing chat input and scrolling
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const PopupBodyRef = useRef(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const ongoingMessageIdRef = useRef<string | null>(null);

  // Prevent scrolling inside chat reference
  const handleChatRefScroll = (e: React.UIEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle input change and update character count
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const message = event.target.value;
    setUserMessage(message);
    setCharCount(message.length);
    if (footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  // Check if device is mobile
  const isMobileDevice = () => {
    return typeof window !== "undefined" && window.innerWidth <= 768;
  };

  // Handle input keydown event
  const handleKeyDownInput = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter") {
      if (isMobileDevice()) return;
      if (event.shiftKey) return;
      event.preventDefault();
      if (charCount < characterLimit && !isResponseStreaming) {
        sendMessage();
      }
    }
  };

  // Forcefully scroll to the latest message
  const HardScrollToCurrentMessage = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight + 64,
      });
      setUserScrolledUp(false);
    }
  };

  // Function to update bot's ongoing message
  const updateOngoingMessage = (message: string = ""): void => {
    if (ongoingMessageIdRef.current == null) {
      HardScrollToCurrentMessage();
      setisResponseAwaiting(false);
      const newMessage: Message = {
        id: Math.random().toString(36).substring(2, 10),
        message,
        sender: "bot",
      };
      ongoingMessageIdRef.current = newMessage.id;
      setMessages((prevMessages: Message[]) => [...prevMessages, newMessage]);
    } else {
      setMessages((prevMessages: Message[]) =>
        prevMessages.map((msg) =>
          msg.id === ongoingMessageIdRef.current ? { ...msg, message } : msg
        )
      );
    }
  };

  // Function to send user message
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    const message = userMessage.trim();
    setChatStarted(true);
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 10),
      message,
      sender: "user",
    };
    setMessages((prev: Message[]) => [...prev, newMessage]);
    setUserMessage("");
    setCharCount(0);
    setisResponseStreaming(true);
    setisResponseAwaiting(true);
    setUserScrolledUp(false);
    try {
      const response = await fetch(
        `http://localhost:8000/api/chat?message=${encodeURIComponent(message)}`
      );
      if (!response.ok) {
        const errorBody = await response.json();
        ongoingMessageIdRef.current = null;
        updateOngoingMessage(
          "ERROR: " + (errorBody.message || "An unknown error occurred.")
        );
        setisResponseStreaming(false);
        return;
      }
      if (!response.body) {
        ongoingMessageIdRef.current = null;
        updateOngoingMessage(
          "ERROR: Response body is null, unable to read stream."
        );
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedMarkdown = "";
      ongoingMessageIdRef.current = null;
      const processText = async ({
        done,
        value,
      }: {
        done: boolean;
        value?: Uint8Array;
      }): Promise<void> => {
        if (done) return;
        if (!value) return;
        const decodedText = decoder.decode(value, { stream: true });
        const lines = decodedText.trim().split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.content) {
                accumulatedMarkdown += decodeURIComponent(
                  escape(atob(jsonData.content))
                );
                await updateOngoingMessage(
                  await marked.parse(accumulatedMarkdown)
                );
              }
              if (jsonData.is_stream_finished) {
                reader.cancel();
                setisResponseStreaming(false);
                break;
              }
            } catch (error) {
              ongoingMessageIdRef.current = null;
              updateOngoingMessage(`ERROR: ${(error as Error).message}`);
              setisResponseStreaming(false);
            }
          }
        }
        return reader.read().then(processText);
      };
      await reader.read().then(processText);
    } catch (error: unknown) {
      ongoingMessageIdRef.current = null;
      updateOngoingMessage(`ERROR: ${(error as Error).message}`);
      setisResponseStreaming(false);
    }
  };

  // Function to smoothly scroll to the latest message
  const SmoothScrollToCurrentMessage = () => {
    if (chatBodyRef.current && !userScrolledUp) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight + 64,
      });
    }
  };

  // Function to detect if user has scrolled up
  const handleScroll = () => {
    if (chatBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
      if (scrollTop + clientHeight + 15 < scrollHeight) {
        setUserScrolledUp(true);
      } else {
        setUserScrolledUp(false);
      }
    }
  };

  // Attach scroll listener to chat body
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!userScrolledUp) {
      SmoothScrollToCurrentMessage();
    }
    if (chatBody) {
      chatBody.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatBody) {
        chatBody.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);

  return (
    <div
      className={`flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-black w-full h-full rounded-none shadow-lg absolute top-0 left-0`}
      ref={PopupBodyRef}
      onScroll={handleChatRefScroll}
    >
      <div
        className={`${styles.VAKChatBaseStyleLight} h-full relative flex flex-col justify-between`}
      >
        {/* Navbar Start */}
        <div className="relative flex justify-center items-start p-4 rounded-none bg-gradient-to-r from-gray-600 via-gray-700 to-gray-900">
          <Image
            src="/logo.png"
            alt="VAKX AI Avatar"
            width={96}
            height={96}
            className={`rounded-full transition-all duration-300 ease-in-out ${
              chatStarted ? "w-10 h-10" : "w-24 h-24 mt-6 mb-6"
            }`}
            priority
          />
          <SidebarTrigger className="ml-1 flex items-center justify-center cursor-pointer absolute text-white border-0 rounded-full p-2 bg-black/15 hover:bg-black/30 hover:scale-110 transition-all duration-300 ease-in-out top-4 left-4" />
        </div>
        {/* Navbar End */}

        {/* Chat Body Start */}
        <div
          className={`flex-grow overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-white dark:scrollbar-track-black border-l-2 border-r-2 border-gray-200 dark:border-gray-900 pt-4 px-2 ${
            chatStarted ? "pb-16" : "pb-4"
          }`}
          ref={chatBodyRef}
        >
          {chatStarted ? (
            <div id="chat-body" className="mt-4 mb-4 mx-auto max-w-3xl w-full">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "bot" ? "justify-start" : "justify-end"
                  }`}
                  style={{ marginBottom: "16px" }}
                >
                  <div
                    className={`flex justify-center items-top rounded-xl ${
                      msg.sender === "bot"
                        ? "w-full p-1"
                        : "bg-gray-100 dark:bg-gray-900 p-3 mr-1 sm:max-w-[70%] max-w-[80%]"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <Image
                        src="/logo.png"
                        alt="VAKX AI Avatar"
                        width={32}
                        height={32}
                        className="rounded-full w-6 h-6 sm:w-8 sm:h-8"
                      />
                    )}
                    <div className="flex flex-col w-full">
                      <div
                        className={`max-w-full overflow-auto text-gray-900 dark:text-gray-100 ${
                          msg.sender === "bot" ? "ml-2 sm:ml-4" : "ml-0"
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.message }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {isResponseAwaiting && (
                <div className="flex items-center p-1">
                  <Image
                    src="/logo.png"
                    alt="VAKX AI Avatar"
                    width={32}
                    height={32}
                    className="rounded-full w-6 h-6 sm:w-8 sm:h-8 animate-pulse"
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              className="mx-auto flex flex-col items-center justify-center"
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "16px",
                maxWidth: "768px",
              }}
            >
              <p className="text-justify px-20">What can I help you with?</p>
            </div>
          )}
        </div>
        {/* Chat Body End */}

        {/* Input Section Start */}
        <div className="border-l-2 border-r-2 border-gray-200 dark:border-gray-900 rounded-none">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            style={{ padding: "16px" }}
          >
            <div className="relative mx-auto transition-all duration-300 ease-in-out mb-0 max-w-[768px]">
              <InputContainer
                rowSize={3}
                handleInputChange={handleInputChange}
                handleKeyDownInput={handleKeyDownInput}
                userMessage={userMessage}
                inputRef={inputRef}
                sendMessage={sendMessage}
                charCount={charCount}
                isResponseStreaming={isResponseStreaming}
                characterLimit={characterLimit}
                chatStarted={chatStarted}
                sendBtnRef={sendBtnRef}
              />
            </div>
          </form>
          <Footer footerRef={footerRef} />
        </div>
        {/* Input Section End */}
      </div>
    </div>
  );
}

const InputContainer: React.FC<InputContainerProps> = ({
  rowSize,
  handleInputChange,
  handleKeyDownInput,
  userMessage,
  inputRef,
  sendMessage,
  charCount,
  isResponseStreaming,
  characterLimit,
  chatStarted,
  sendBtnRef,
}) => {
  const charCountClass =
    charCount > characterLimit
      ? "text-red-500"
      : "text-gray-900 dark:text-gray-100";

  return (
    <div className="input-container">
      {chatStarted ? (
        <div
          id="input-form"
          className="group flex items-end dynamic-text-base rounded-[24px] gap-2 p-1 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 focus-within:bg-gray-200 dark:focus-within:bg-gray-800"
        >
          <textarea
            rows={rowSize}
            id="inputMessage"
            ref={inputRef}
            value={userMessage}
            autoComplete="off"
            placeholder="Message VAKGPT"
            onChange={handleInputChange}
            onKeyDown={handleKeyDownInput}
            className="w-full resize-none text-gray-900 bg-gray-100 focus:bg-gray-200 dark:text-gray-100 dark:bg-gray-900 dark:focus:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none p-3 rounded-3xl dynamic-text-base font-normal"
          />

          <button
            ref={sendBtnRef}
            onClick={sendMessage}
            disabled={
              !userMessage.trim() ||
              charCount > characterLimit ||
              isResponseStreaming
            }
            className={`flex items-center border-0 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-50 p-2`}
          >
            <ArrowUp />
          </button>
        </div>
      ) : (
        <div
          id="input-form"
          className="group text-gray-900 flex items-end bg-gray-100 focus-within:bg-gray-200 dark:text-gray-100 dark:bg-gray-900 dark:focus-within:bg-gray-800 dynamic-text-base flex gap-2 p-1 rounded-3xl"
        >
          <textarea
            rows={rowSize}
            id="inputMessage"
            ref={inputRef}
            value={userMessage}
            autoComplete="off"
            placeholder="How can I assist you today?"
            onChange={handleInputChange}
            onKeyDown={handleKeyDownInput}
            className="w-full resize-none text-gray-900 bg-gray-100 focus:bg-gray-200 dark:text-gray-100 dark:bg-gray-900 dark:focus:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none p-3 rounded-3xl dynamic-text-base font-normal"
          />

          <button
            ref={sendBtnRef}
            onClick={sendMessage}
            disabled={
              !userMessage.trim() ||
              charCount > characterLimit ||
              isResponseStreaming
            }
            className="flex items-center border-0 bg-black dark:bg-white text-white dark:text-black rounded-full disabled:opacity-50"
            style={{ padding: "8px" }}
          >
            <ArrowUp />
          </button>
        </div>
      )}

      <div className="font-sans char-counter text-sm text-gray-500 text-right mt-1">
        <span id="char-count" className={charCountClass}>
          {charCount}
        </span>
        <span>/{characterLimit}</span>
      </div>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ footerRef }) => {
  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 font-sans flex relative text-sm text-gray-500 items-center justify-center rounded-none pt-2 pb-2"
      ref={footerRef}
    ></div>
  );
};

export default ChatInterface;
