"use client";

import { RefObject, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowUp, Globe, Paperclip, X } from "lucide-react";
import { marked } from "marked";
import Cookies from "js-cookie";
import { SidebarTrigger } from "@/components/ui/sidebar";
import styles from "./index.module.css";

// Message interface to handle chat messages
interface Message {
  id: string;
  message: string;
  sender: "user" | "bot";
}

interface RawMessage {
  id: string;
  message: string;
  sender: "ai" | "user";
  timestamp: string;
}

// Props for `ChatInterface`
interface ChatInterfaceProps {
  selectedSession: string;
}

// Props for the InputContainer component
interface InputContainerProps {
  rowSize: number;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDownInput: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  toggleWebSearchBtnState: () => void;
  userMessage: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  sendMessage: () => void;
  charCount: number;
  isResponseStreaming: boolean;
  characterLimit: number;
  sendBtnRef: RefObject<HTMLButtonElement | null>;
  isWebSearchActive: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  clearFile: () => void;
}

// Props for the Footer component
interface FooterProps {
  footerRef: RefObject<HTMLDivElement | null>;
}

export function ChatInterface({ selectedSession }: ChatInterfaceProps) {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponseAwaiting, setisResponseAwaiting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [characterLimit] = useState(10000);
  const [isResponseStreaming, setisResponseStreaming] = useState(false);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [isWebSearchActive, setIsWebSearchActive] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [chatStarted, setChatStarted] = useState<boolean>(false);

  // Refs for managing chat input and scrolling
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const PopupBodyRef = useRef(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const ongoingMessageIdRef = useRef<string | null>(null);

  const fetchMessages = useCallback(
    async (currentPage: number) => {
      try {
        setLoadingMessages(true);
        const token = Cookies.get("token");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session/get_session_chat?session_id=${selectedSession}&page=${currentPage}`,
          { method: "GET", headers }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }

        const data = await response.json();

        if (data?.messages.length === 0) {
          setHasMoreMessages(false);
          setChatStarted(false);
          return;
        } else {
          setChatStarted(true);
        }

        const formattedMessages: Message[] = data.messages
          .reverse()
          .map((msg: RawMessage) => ({
            id: msg.id,
            message:
              msg.sender === "ai" ? marked.parse(msg.message) : msg.message,
            timestamp: msg.timestamp,
            sender: msg.sender === "ai" ? "bot" : "user",
          }));

        if (currentPage === 1) {
          setMessages(formattedMessages);
        } else {
          setMessages((prevMessages) => [
            ...formattedMessages,
            ...prevMessages,
          ]);
        }

        setHasMoreMessages(data.pagination.has_next_page);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoadingMessages(false);
      }
    },
    [selectedSession, setLoadingMessages, setHasMoreMessages, setMessages]
  );

  useEffect(() => {
    if (!selectedSession) return;
    setMessages([]);
    setPage(1);
    fetchMessages(1);
    HardScrollToCurrentMessage();
  }, [selectedSession, fetchMessages]);

  useEffect(() => {
    if (page > 1) {
      fetchMessages(page);
    }
  }, [page, fetchMessages]);

  const loadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !loadingMessages) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMoreMessages, loadingMessages, setPage]);

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

  // Function to handle the attach file button
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  function generateTempUser() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let result = "TEMP_";
    for (let i = 0; i < 25; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  // Function to send user message
  const sendMessage = async () => {
    if (!userMessage.trim()) return;
    const message = userMessage.trim();
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
    setChatStarted(true);
    try {
      let temp_user = "";
      const token = Cookies.get("token");
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        temp_user = generateTempUser();
      }
      const formData = new FormData();
      formData.append("message", message);
      formData.append("session_id", selectedSession);
      formData.append("model", "meta-llama/Meta-Llama-3.1-405B-Instruct");
      formData.append("temp_user", temp_user);

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`,
        {
          method: "POST",
          headers,
          body: formData,
        }
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

  const SmoothScrollToCurrentMessage = useCallback(() => {
    if (chatBodyRef.current && !userScrolledUp) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight + 64,
      });
    }
  }, [chatBodyRef, userScrolledUp]);

  const handleScroll = useCallback(() => {
    if (!chatBodyRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;

    // Detect user scrolling
    if (scrollTop + clientHeight + 15 < scrollHeight) {
      setUserScrolledUp(true);
    } else {
      setUserScrolledUp(false);
    }

    // If scrolled to the top, load more messages
    if (scrollTop === 0) {
      loadMoreMessages();
    }
  }, [chatBodyRef, setUserScrolledUp, loadMoreMessages]);

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
  }, [messages, SmoothScrollToCurrentMessage, handleScroll, userScrolledUp]);

  // Toggle Web Search Tool
  const toggleWebSearchBtnState = () => {
    setIsWebSearchActive(!isWebSearchActive);
  };
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
          className={`flex-grow overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-white dark:scrollbar-track-black pt-4 px-2 ${
            chatStarted ? "pb-16" : "pb-4"
          }`}
          ref={chatBodyRef}
        >
          {chatStarted ? (
            <div
              id="chat-body"
              className="mt-4 mb-4 mx-auto max-w-[850px] w-full"
            >
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
                    {msg.sender === "bot" ? (
                      <div className="flex justify-center items-top rounded-xl w-full p-1">
                        <Image
                          src="/logo.png"
                          alt="VAKX AI Avatar"
                          width={32}
                          height={32}
                          className="rounded-full w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <div className="flex flex-col w-full">
                          <div
                            className={`max-w-full overflow-auto text-gray-900 dark:text-gray-100 ml-2 sm:ml-4`}
                            dangerouslySetInnerHTML={{ __html: msg.message }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full">
                        <div className="whitespace-pre-wrap">{msg.message}</div>
                      </div>
                    )}
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
              className="mx-auto flex flex-col items-center justify-center max-w-[850px] w-full"
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: "16px",
                maxWidth: "768px",
              }}
            ></div>
          )}
        </div>
        {/* Chat Body End */}

        {/* Input Section Start */}
        <div className={`${chatStarted ? "" : "mb-40"}`}>
          {!chatStarted && (
            <h2 className="text-center px-4">What can I help with?</h2>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-4"
          >
            <div className="relative mx-auto transition-all duration-300 ease-in-out mb-0 max-w-[850px]">
              <InputContainer
                rowSize={3}
                handleInputChange={handleInputChange}
                handleKeyDownInput={handleKeyDownInput}
                toggleWebSearchBtnState={toggleWebSearchBtnState}
                userMessage={userMessage}
                inputRef={inputRef}
                sendMessage={sendMessage}
                charCount={charCount}
                isResponseStreaming={isResponseStreaming}
                characterLimit={characterLimit}
                sendBtnRef={sendBtnRef}
                isWebSearchActive={isWebSearchActive}
                handleFileChange={handleFileChange}
                file={file}
                clearFile={clearFile}
              />
            </div>
          </form>
        </div>
        {/* Input Section End */}
        <Footer footerRef={footerRef} />
      </div>
    </div>
  );
}

const InputContainer: React.FC<InputContainerProps> = ({
  rowSize,
  handleInputChange,
  handleKeyDownInput,
  toggleWebSearchBtnState,
  userMessage,
  inputRef,
  sendMessage,
  charCount,
  isResponseStreaming,
  characterLimit,
  sendBtnRef,
  isWebSearchActive,
  handleFileChange,
  file,
  clearFile,
}) => {
  const charCountClass =
    charCount > characterLimit
      ? "text-red-500"
      : "text-gray-900 dark:text-gray-100";

  return (
    <div className="input-container">
      <div
        id="input-form"
        className="group text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-900 dynamic-text-base gap-2 p-1 rounded-3xl"
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
        />

        {file && (
          <div className="flex items-center space-x-2 my-2 text-sm w-max bg-gray-200 border py-1 px-2 rounded-full">
            <span>{file.name}</span>
            <button onClick={clearFile} className="hover:text-red-500">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex justify-center gap-2">
            <div className="hidden flex items-center gap-2">
              <input
                type="file"
                accept="application/pdf"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <label
                htmlFor="fileInput"
                className="flex items-center cursor-pointer bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 hover:bg-gray-300 border border-gray-300 rounded-full transition duration-300 py-2 px-3"
              >
                <Paperclip />
              </label>
            </div>

            <button
              onClick={toggleWebSearchBtnState}
              className={`hidden flex items-center ${
                isWebSearchActive
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-100 dark:bg-black text-gray-800 dark:text-gray-200 hover:bg-gray-300"
              } border border-gray-300 rounded-full disabled:opacity-50 transition duration-300 py-2 px-3`}
            >
              <Globe className="mr-2" />
              Search
            </button>
          </div>

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
      </div>

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
      className="flex relative items-center justify-center rounded-none pt-2 pb-2"
      ref={footerRef}
    >
      <span className="text-xs text-gray-500">
        VAKGPT can make mistakes. Check important info.
      </span>
    </div>
  );
};

export default ChatInterface;
