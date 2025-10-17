import React from "react";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Brain,
  Users,
  Zap,
  Target,
  Download,
  Calendar,
  Clock,
} from "lucide-react";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { auth }  from "@/firebase/admin";

interface PageProps {
  params: { id: string };
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Needs Improvement";
};

const categoryIcons: Record<string, React.ReactNode> = {
  "Communication Skills": <Users className="w-5 h-5" />,
  "Technical Knowledge": <Brain className="w-5 h-5" />,
  "Problem-Solving": <Target className="w-5 h-5" />,
  "Cultural & Role Fit": <Award className="w-5 h-5" />,
  "Confidence & Clarity": <Zap className="w-5 h-5" />,
};

export default async function FeedbackPage({ params }: PageProps) {
  // ✅ FIX 1: `params` is not a Promise — directly use it
  const { id: interviewId } = params;

  // ✅ FIX 2: `auth()` gives user object (handle missing gracefully)
  const user = await auth();
  if (!user || !user.userId) redirect("/sign-in");

  const userId = user.userId;

  // ✅ Fetch interview and feedback data
  const interview = await getInterviewById(interviewId);
  const feedback = await getFeedbackByInterviewId({ interviewId, userId });

  // ✅ Handle missing feedback/interview
  if (!interview || !feedback) {
    redirect("/");
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-slate-900">
              Interview Feedback
            </h1>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Role
              </p>
              <p className="font-semibold text-slate-900">
                {interview.role || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Level
              </p>
              <p className="font-semibold text-slate-900">
                {interview.level || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date
              </p>
              <p className="font-semibold text-slate-900">
                {interview.createdAt ? formatDate(interview.createdAt) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Type
              </p>
              <p className="font-semibold text-slate-900 capitalize">
                {interview.type || "N/A"}
              </p>
            </div>
          </div>

          {interview.techstack && interview.techstack.length > 0 && (
            <div className="mt-4">
              <p className="text-slate-500 text-sm mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {interview.techstack.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
          <div className="text-center">
            <p className="text-slate-500 mb-4 text-lg">Overall Score</p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={
                    feedback.totalScore >= 80
                      ? "#10b981"
                      : feedback.totalScore >= 60
                      ? "#eab308"
                      : "#ef4444"
                  }
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 70 * (1 - feedback.totalScore / 100)
                  }`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute">
                <p className="text-5xl font-bold text-slate-900">
                  {feedback.totalScore}
                </p>
                <p
                  className={`text-sm font-medium ${getScoreColor(
                    feedback.totalScore
                  )}`}
                >
                  {getScoreLabel(feedback.totalScore)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance by Category
          </h2>
          <div className="space-y-5">
            {Object.entries(feedback.categoryScores).map(([category, score]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      {categoryIcons[category]}
                    </span>
                    <span className="font-medium text-slate-700 text-sm">
                      {category}
                    </span>
                  </div>
                  <span className={`font-bold ${getScoreColor(score as number)}`}>
                    {score}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${getScoreBgColor(
                      score as number
                    )}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Key Strengths
          </h2>
          <div className="space-y-3">
            {feedback.strengths.map((strength: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 text-sm leading-relaxed">
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Areas for Improvement
          </h2>
          <div className="space-y-3">
            {feedback.areasForImprovement.map((area: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-slate-700 text-sm leading-relaxed">{area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Assessment */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-sm p-6 md:p-8 text-white border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Final Assessment
          </h2>
          <p className="text-slate-200 leading-relaxed">
            {feedback.finalAssessment}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/interview/new"
            className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-center"
          >
            Schedule Another Interview
          </a>
          <a
            href={`/interview/${interviewId}`}
            className="flex-1 px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-50 transition-colors font-medium border border-slate-200 text-center"
          >
            View Full Transcript
          </a>
        </div>
      </div>
    </div>
  );
}
