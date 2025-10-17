"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { createInterview } from "@/lib/actions/auth.action";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

type AgentProps = {
  userName: string;
  userId: string;
  type: string;
  interviewId: string;
  questions?: string[];
  role: string;
  level: string;
  techstack: string[];
};

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions = [],
  role,
  level,
  techstack,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);

  // --- VAPI event listeners
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setMessages((prev) => [...prev, { role: message.role, content: message.transcript }]);
      }
    };

    const onError = (error: Error) => console.error("VAPI Error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  // --- Generate feedback after call finishes
  useEffect(() => {
    if (callStatus === CallStatus.FINISHED && messages.length > 0 && !feedbackGenerated) {
      handleGenerateFeedback();
    }
  }, [callStatus]);

  const handleGenerateFeedback = async () => {
    try {
      // 1️⃣ Save interview
      await createInterview({
        userId,
        type,
        role,
        level,
        techstack,
        questions,
        transcript: messages,
        finalized: true,
      });

      // 2️⃣ Generate feedback
      const { success, feedbackId } = await createFeedback({
        interviewId,
        userId,
        transcript: messages,
      });

      if (success && feedbackId) {
        setFeedbackGenerated(true);
        router.push(`/interview/${interviewId}/feedback`); // Redirect to feedback page
      } else {
        console.error("Feedback generation failed");
        router.push(`/`); // fallback
      }
    } catch (error) {
      console.error("Error saving interview or generating feedback:", error);
      router.push(`/`);
    }
  };

  // --- Start call
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    let formattedQuestions = questions.map((q) => `- ${q}`).join("\n");

    await vapi.start(interviewer, {
      variableValues: { questions: formattedQuestions, username: userName, userid: userId },
    });
  };

  // --- Disconnect call manually
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  return (
    <>
      {/* Interviewer & User UI */}
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="vapi" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call controls */}
      <div className="w-full flex justify-center mt-4">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn("absolute animate-ping rounded-full opacity-75", callStatus === "CONNECTING" && "hidden")}
            />
            <span>{isCallInactiveOrFinished ? "Call" : "..."}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
