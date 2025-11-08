"use client";

import { useState, useEffect } from "react";
import VideoPreview from "@/components/video-preview";
import InterviewChatPane from "@/components/interview-chat-pane";
import InterviewControls from "@/components/interview-controls";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStrapi } from "@/lib/api/useStrapi";
import { useChat } from "./useChat";
import { useMurfTTS } from "./useMurfTTS";
import toast from "react-hot-toast";
import { strapi } from "@/lib/api/sdk";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

export default function InterviewPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [startAnalyticts, setStartAnalyticts] = useState<any>(null);
  const [stopAnalyticts, setStopAnalyticts] = useState<any>(null);

  const [showStartModal, setShowStartModal] = useState(true); // show modal initially

  const router = useRouter();

  const {
    generateSpeech,
    stop,
    unlockPlayback,
    isPlaying,
    setIsLoading: setIsSpeechLoading,
    isLoading: isSpeechLoading,
    error: speechError,
  } = useMurfTTS({ voiceId: "en-US-natalie" });

  const { sendMessage, isLoading: isChatLoading } = useChat({
    messages,
    setMessages,
    setAiSpeaking,
    setIsInterviewCompleted,
    generateSpeech,
  });

  const { data, error, isLoading } = useStrapi("interviews", {
    populate: "*",
    filters: { documentId: params.id },
  });

  const interviewData: any = data?.data;

  const interviewDetails = {
    topic: interviewData?.[0]?.details || "",
    difficulty: interviewData?.[0]?.difficulty || "medium",
    mode: interviewData?.[0]?.mode || "text",
    numOfQuestions: interviewData?.[0]?.numberOfQuestions,
    skills: interviewData?.[0]?.skills || "",
    username: interviewData?.[0]?.candidateName || "",
  };
  const resumeUrl = interviewData?.[0]?.resume || "";

  // Initial greeting
  const initialGreetings = async () => {
    try {
      const content = [
        ...(resumeUrl
          ? [{ type: "image_url", image_url: { url: resumeUrl } }]
          : []),
        {
          type: "text",
          text: interviewDetails.username
            ? "Hello I am " + interviewDetails.username
            : "",
        },
      ];

      await sendMessage({ content, interviewDetails });
    } catch (error) {
      console.log("Initial greeting failed", error);
    }
  };

  const startInterview = () => {
    unlockPlayback();
    initialGreetings();
    setShowStartModal(false);

    if (startAnalyticts) startAnalyticts();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col gap-8 items-center w-full h-[80vh]">
        <div>Loading interview...</div>
      </div>
    );
  }

  return (
    <main className="grid  min-h-[80vh] grid-rows-[auto_1fr] relative">
      {/* Start Modal */}
      {showStartModal && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-2xl text-white">
          <h1 className="text-4xl font-bold animate-pulse mb-4">
            Start Interview
          </h1>
          <Button onClick={startInterview} className="px-6 py-3">
            Click to Start
          </Button>
        </div>
      )}

      <div className="h-10" aria-hidden />

      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Interview Session</h1>
          <div className="text-sm text-muted-foreground">ID: {params.id}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-15">
        {/* Left: Full-height user video */}
        <section className="order-2 md:order-1 md:col-span-8">
          <Card className="m-4 h-[calc(100vh-120px)] overflow-hidden p-0 md:m-6">
            <VideoPreview
              startFn={setStartAnalyticts}
              stopFn={setStopAnalyticts}
            />
          </Card>
        </section>

        {/* Right: AI text panel and controls */}
        <aside className="order-1 md:order-2 md:col-span-7">
          <div className="m-4 flex h-[calc(100vh-120px)] flex-col gap-4 md:m-6">
            <Card className="flex-1 overflow-hidden">
              <InterviewChatPane
                messages={messages}
                isSpeechLoading={isSpeechLoading || aiSpeaking}
                setMessages={setMessages}
              />
            </Card>
            <Card className="p-4 flex items-center justify-center">
              {!isInterviewCompleted ? (
                <InterviewControls
                  aiSpeaking={isSpeechLoading || isPlaying || aiSpeaking}
                  mode={mode}
                  listening={listening}
                  text={text}
                  // setAiSpeaking={setAiSpeaking}
                  setMode={setMode}
                  setListening={setListening}
                  setText={setText}
                  handleSend={async (c) => {
                    await sendMessage({ content: c, interviewDetails });
                    setIsSpeechLoading(true);
                    setText("");
                  }}
                />
              ) : (
                <Button
                  onClick={async () => {
                    setIsGeneratingReport(true);
                    try {
                      let feed = "";
                      if (stopAnalyticts) {
                        feed = stopAnalyticts();
                      }
                      await strapi.update("interviews", params.id, {
                        conversation: messages,
                      });
                      const res = await fetch("/api/interview/report", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          messages,
                          interviewDetails,
                          faceMeshFeedback: feed,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed to generate report");

                      const report = await res.json();
                      // const report = data?.report;
                      if (report) {
                        await strapi.update("interviews", params.id, {
                          report: JSON.stringify(report),
                        });
                      }
                      toast.success("Report generated!");
                      router.push("/reports");
                    } catch (err) {
                      console.error(err);
                      toast.error("Could not generate report");
                    } finally {
                      setIsGeneratingReport(false);
                    }
                  }}
                  disabled={isGeneratingReport}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    "Generate Interview Report"
                  )}
                </Button>
              )}
            </Card>
          </div>
        </aside>
      </div>
    </main>
  );
}
