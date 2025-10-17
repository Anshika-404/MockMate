"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import Agent from "@/components/Agent";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function PageClient({ user, userInterviews }: any) {
  const [formData, setFormData] = useState({
    role: "",
    level: "",
    techstack: "",
  });

   if (!user) {
    redirect("/sign-in");
  }
  const [startInterview, setStartInterview] = useState(false);

  const hasPastInterviews = userInterviews?.length > 0;

  if (startInterview) {
    return (
      <Agent
        userName={user?.name ?? ""}
        userId={user?.id ?? ""}
        type="interview"
        role={formData.role}
        level={formData.level}
        techstack={formData.techstack.split(",")}
      />
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>
          <Button
            className="btn btn-primary max-sm:w-full"
            onClick={() => setStartInterview(true)}
          >
            Start Interview
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* Past Interviews */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview: any) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      {/* Performance Overview Section */}
      <section className="flex flex-col gap-6 mt-12">
        <h2>Your AI Insights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Confidence Score */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-300 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              AI Confidence Score
            </h3>
            <div className="w-full bg-blue-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: "87%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Current Score: 87%</p>
          </div>

          {/* Performance Overview */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-400/10 to-green-600/10 border border-green-300 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-green-700 mb-3">
              Performance Overview
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              Strongest area: System Design
            </p>
            <div className="w-full bg-green-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: "92%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Excellent Performance</p>
          </div>

          {/* Practice Hours */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-400/10 to-purple-600/10 border border-purple-300 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">
              Practice Hours
            </h3>
            <p className="text-4xl font-bold text-purple-600 mb-2">14 hrs</p>
            <p className="text-sm text-gray-700">Total time practiced</p>
          </div>

          {/* AI Analyzed Progress */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-400/10 to-orange-600/10 border border-orange-300 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-orange-700 mb-3">
              AI-Analyzed Progress
            </h3>
            <div className="w-full bg-orange-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-orange-600 h-2.5 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-700">Improved by +32% this month</p>
          </div>
        </div>
      </section>

     {/* Footer */}
      <footer className="border-t py-8 mt-12 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MockMate AI. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>
      </footer>
    </>
  );
}
