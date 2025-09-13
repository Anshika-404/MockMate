"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import Agent from "@/components/Agent";

export default function PageClient({ user, userInterviews, latestInterviews }: any) {
    const [formData, setFormData] = useState({
        role: "",
        level: "",
        techstack: "",
    });
    const [startInterview, setStartInterview] = useState(false);

    const hasPastInterviews = userInterviews?.length > 0;
    const hasUpcomingInterviews = latestInterviews?.length > 0;

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
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Get Interview-Ready wih AI-Powered Practice & Feedback</h2>
                    <p className="text-lg">
                        Practice on real interview questions & get instant feedback
                    </p>
                    <Button className="btn btn-primary max-sm:w-full" onClick={() => setStartInterview(true)}>
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

            <section className="flex flex-col gap-6 mt-8">
                <h2>Take an Interview</h2>
                <div className="interviews-section">
                    {hasUpcomingInterviews ? (
                        latestInterviews?.map((interview: any) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <p>There are no new interviews available</p>
                    )}
                </div>
            </section>
        </>
    );
}
