"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState<string>("");

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default behavior of Enter key in textarea
      console.log("User pressed Enter");
      handleQuerySubmit();
    }
  };

  const handleQuerySubmit = () => {
    window.localStorage.setItem("selectedQuestion", query);
    location.href = "/chat";
  };

  return (
    <div className="">
      <header className="p-4 bg-gray-100">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center space-x-2">
            <Image
              className=""
              src={"/logo.png"}
              alt="VAKGPT Logo"
              width={30}
              height={30}
            />
            <span>VAKGPT</span>
          </div>
          <div className="flex space-x-8 justify-items-center">
            <a href="/chat">Chat</a>
            <a
              href="https://github.com/kk9393/VAKGPT"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.shields.io/github/stars/kk9393/VAKGPT?style=social"
                alt="GitHub Repo stars"
              />
            </a>
          </div>

        </nav>
      </header>
      <section className="pt-6 pb-10 bg-gray-100">
        <div
          className="flex flex-col mx-auto rounded-2xl bg-white h-[70vh] w-[95vw] lg:w-[80vw] cursor-pointer"
          onClick={() => {
            window.location.href = "/chat";
          }}
        >
          <main className="flex-grow flex items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <Image
                className="mx-auto mb-12"
                src={"/logo.png"}
                alt="VAKGPT Logo"
                width={100}
                height={100}
              />
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                Ask VAKGPT Anything
              </h1>
              <p className="text-xl mb-8">Chat with AI</p>
              <div className="max-w-3xl mx-auto flex items-center">
                <div className="w-full group text-gray-900 flex items-end bg-gray-100 focus-within:bg-gray-200 dynamic-text-base gap-2 p-1 rounded-full">
                  <textarea
                    rows={1}
                    id="inputMessage"
                    className="text-gray-900 border-0 resize-none w-full focus:outline-none focus:border-0 bg-gray-100 focus:bg-gray-200 dynamic-text-base font-normal m-0 px-3 py-2 rounded-full"
                    value={query}
                    autoComplete="off"
                    placeholder="How can I assist you today?"
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDownInput}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuerySubmit();
                    }}
                    className={`flex items-center border-0 bg-black text-white rounded-full disabled:opacity-50`}
                    style={{
                      padding: "8px",
                    }}
                  >
                    <ArrowUp />
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      <div className="min-h-screen bg-white max-w-screen-xl mx-auto">
        <header className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">VAKGPT</h1>
          <h2 className="text-2xl md:text-3xl font-semibold  mb-8">
            Unlock the Power of Open-Source Conversational AI
          </h2>
          <a href="/chat">
            <Button size="lg" className="text-white">
              Start Chatting
            </Button>
          </a>
        </header>

        <main className="container mx-auto px-4 py-12">
          <section className="mb-16">
            <h3 className="text-2xl font-bold mb-6">
              Key Features of VAKGPT
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Conversational Interface",
                  description:
                    "VAKGPT provides a chat-based interface that enables users to interact with AI using natural language, making conversations intuitive and engaging.",
                },
                {
                  title: "Open-Source",
                  description:
                    "Built on open-source technology under the MIT License, VAKGPT ensures transparency, flexibility, and community-driven development.",
                },
                {
                  title: "Scalable",
                  description:
                    "Designed to handle large volumes of conversations, VAKGPT is an ideal solution for businesses and developers.",
                },
                {
                  title: "Powered by LangChain",
                  description:
                    "VAKGPT is built on LangChain, enabling advanced capabilities, seamless integration with vector databases, and efficient handling of complex AI workflows.",
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-screen-lg mx-auto">
            <h3 className="text-2xl font-bold  mb-6">
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="">
              {[
                {
                  question: "What is VAKGPT?",
                  answer:
                    "VAKGPT is an open-source conversational AI platform designed to build and deploy AI chatbots. It provides a scalable, modular, and customizable framework for developers to create AI-driven conversational applications.",
                },
                {
                  question: "How is VAKGPT different from other chatbot platforms?",
                  answer:
                    "Unlike proprietary chatbot solutions, VAKGPT is open-source, allowing developers to customize and extend its functionalities. It also supports modular components, making it easy to integrate with various AI models and data sources.",
                },
                {
                  question: "Can I use VAKGPT for commercial applications?",
                  answer:
                    "Yes, VAKGPT is MIT-licensed, meaning you are free to use, modify, and distribute it for both personal and commercial applications. The only requirement is to retain the original copyright and license notice in your project.",
                },
                {
                  question: "How can I contribute to VAKGPT?",
                  answer:
                    "You can contribute to VAKGPT by submitting issues, creating pull requests, improving documentation, or suggesting new features. Visit the GitHub repository to get started with contributions.",
                }

              ].map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left ">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer.split("\n").map((line, i) => (
                      <p key={i} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="text-center mt-24 bg-gray-100 p-10 rounded-2xl">
            <h3 className="text-2xl font-bold  mb-6">
              Get Started with VAKGPT Today!
            </h3>
            <a href="/chat">
              <Button size="lg" className=" text-white">
                Start Chatting
              </Button>
            </a>
          </section>
        </main>

        <footer className="py-8 mt-16">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 VAKGPT. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
