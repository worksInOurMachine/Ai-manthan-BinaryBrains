import React from "react";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

// Example `report` prop will be used if none is provided. Pass your parsed JSON as `report` prop.
export default function InterviewReport({ report }: { report?: any }) {
  const data = report;

  const scoreBars = [
    { name: "Technical", value: data.scores.technicalKnowledge },
    { name: "Communication", value: data.scores.communication },
    { name: "Problem Solving", value: data.scores.problemSolving },
    { name: "Confidence", value: data.scores.confidenceLevel },
    { name: "Engagement", value: data.scores.engagement },
    { name: "Composure", value: data.scores.composure },
  ];

  const radarData = [
    { subject: "Technical", A: data.scores.technicalKnowledge, fullMark: 10 },
    { subject: "Communication", A: data.scores.communication, fullMark: 10 },
    { subject: "Problem Solving", A: data.scores.problemSolving, fullMark: 10 },
    { subject: "Confidence", A: data.scores.confidenceLevel, fullMark: 10 },
    { subject: "Engagement", A: data.scores.engagement, fullMark: 10 },
    { subject: "Composure", A: data.scores.composure, fullMark: 10 },
  ];

  const formatName = (s: any) =>
    s.replace(/(^|\s)\S/g, (t: any) => t.toUpperCase());

  return (
    // Main container with dark theme
    <div className="min-h-screen bg-slate-900 p-6 text-slate-200 sm:p-10">
      <div className="max-w-full mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interview Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Candidate:{" "}
              <span className="font-medium text-slate-200">
                {formatName(data.candidateInformation.candidateName)}
              </span>
              {" • "}
              Role:{" "}
              <span className="font-medium text-slate-200">
                {formatName(data.candidateInformation.jobRole)}
              </span>
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-right">
              <p className="text-xs text-slate-400">Mode</p>
              <p className="font-medium">
                {formatName(data.candidateInformation.mode)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Difficulty</p>
              <p className="font-medium">
                {formatName(data.candidateInformation.difficulty)}
              </p>
            </div>
            {/* Dark mode card for stats */}
            <div className="hidden sm:block bg-slate-800 border border-slate-700 rounded-lg p-3">
              <p className="text-xs text-slate-400">Questions</p>
              <p className="font-medium">
                {data.candidateInformation.numOfQuestions}
              </p>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Dark mode card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="text-sm text-slate-400">Candidate Info</h3>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Name</span>
                  <span className="font-medium text-slate-200">
                    {formatName(data.candidateInformation.candidateName)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Role</span>
                  <span className="font-medium text-slate-200">
                    {formatName(data.candidateInformation.jobRole)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Skills</span>
                  <span className="font-medium text-slate-200">
                    {data.candidateInformation.skillsAssessed}
                  </span>
                </div>
              </div>
            </div>

            {/* Dark mode card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="text-sm text-slate-400">Facial Analytics</h3>
              <p className="mt-2 text-sm text-slate-300">
                {data.facialAnalytics.emotionSummary}
              </p>
              <p className="mt-3 text-xs text-slate-400">Notes</p>
              <p className="text-sm text-slate-300 mt-1">
                {data.facialAnalytics.notes}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400">Confidence</p>
                  <p className="font-semibold text-slate-100">
                    {data.scores.confidenceLevel}/10
                  </p>
                </div>
                <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400">Engagement</p>
                  <p className="font-semibold text-slate-100">
                    {data.scores.engagement}/10
                  </p>
                </div>
                <div className="text-center p-2 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400">Composure</p>
                  <p className="font-semibold text-slate-100">
                    {data.scores.composure}/10
                  </p>
                </div>
              </div>
            </div>

            {/* Dark mode card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <h3 className="text-sm text-slate-400">Quick Recommendation</h3>
              <div className="mt-3">
                <p className="text-lg font-semibold text-white">
                  {data.overallPerformance.hiringRecommendation}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {data.overallPerformance.justification}
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Middle column */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            {/* Dark mode card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white">
                Answer Analysis
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                {data.answerAnalysis.candidateAnswersSummary}
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-200">
                    Strengths
                  </h4>
                  {data.answerAnalysis.strengths.length ? (
                    <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
                      {data.answerAnalysis.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">None detected</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-200">
                    Weaknesses
                  </h4>
                  {data.answerAnalysis.weaknesses.length ? (
                    <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
                      {data.answerAnalysis.weaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">None detected</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs text-slate-400">
                    Communication Style
                  </h5>
                  <p className="mt-1 text-sm text-slate-300">
                    {data.answerAnalysis.communicationStyle}
                  </p>
                </div>
                <div>
                  <h5 className="text-xs text-slate-400">Problem Solving</h5>
                  <p className="mt-1 text-sm text-slate-300">
                    {data.answerAnalysis.problemSolvingApproach}
                  </p>
                </div>
                <div>
                  <h5 className="text-xs text-slate-400">Insights</h5>
                  <ul className="mt-1 text-sm text-slate-300 list-disc list-inside">
                    {data.answerAnalysis.insights.map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dark mode card */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white">Scores</h3>
                <p className="text-sm text-slate-400 mt-1">
                  (All scores out of 10)
                </p>

                <div className="mt-4 space-y-3">
                  {scoreBars.map((s) => (
                    <div key={s.name} className="">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{s.name}</span>
                        <span className="font-semibold text-slate-100">
                          {s.value}/10
                        </span>
                      </div>
                      {/* Dark mode progress bar track */}
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-yellow-400 h-2 rounded-full"
                          style={{ width: `${(s.value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 h-56">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      data={radarData}
                    >
                      {/* Dark mode grid */}
                      <PolarGrid stroke="#334155" /> {/* slate-700 */}
                      {/* Dark mode axis text */}
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="#475569" // slate-600
                        tick={{ fill: "#94a3b8", fontSize: 12 }} // slate-400
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 10]}
                        stroke="#334155" // slate-700
                        tick={{ fill: "#94a3b8" }} // slate-400
                      />
                      <Radar
                        name="Candidate"
                        dataKey="A"
                        stroke="#6366F1" // indigo-500
                        fill="#6366F1" // indigo-500
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dark mode card */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Final Summary & Next Steps
                </h3>
                <p className="mt-3 text-sm text-slate-300">
                  {data.summaryAndNextSteps.finalSummary}
                </p>

                <h4 className="mt-4 text-sm font-medium text-slate-200">
                  Rationale
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
                  {data.summaryAndNextSteps.rationale.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>

                <h4 className="mt-4 text-sm font-medium text-slate-200">
                  Actionable Next Steps
                </h4>
                <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
                  {data.summaryAndNextSteps.actionableNextSteps.map(
                    (a, idx) => (
                      <li key={idx}>{a}</li>
                    )
                  )}
                </ul>

                <div className="mt-6 flex items-center gap-3">
                  {/* Dark mode icon container */}
                  <div className="p-3 bg-slate-700 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-indigo-400" // Accent color icon
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Recommendation:{" "}
                      <span className="font-bold text-white">
                        {data.summaryAndNextSteps.recommendation}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      {data.summaryAndNextSteps.recommendation === "Yes"
                        ? "Strong fit"
                        : data.summaryAndNextSteps.recommendation === "Maybe"
                        ? "Consider with training"
                        : "Not recommended"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
