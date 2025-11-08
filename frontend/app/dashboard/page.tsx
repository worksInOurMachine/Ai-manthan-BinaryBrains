"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { useStrapi } from "@/lib/api/useStrapi";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession<any>();
  const { data, error, isLoading } = useStrapi(
    `dashboard/${session?.user?.id}`,
    {
      populate: "*",
    }
  );

  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    if (data) setDashboard(data);
  }, [data]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center text-center mt-10 text-gray-300">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center text-center mt-10 text-red-500">
        Error loading dashboard
      </div>
    );

  if (!dashboard) return null;

  const { overview, charts, recentReports } = dashboard;

  return (
    <main className="min-h-screen pt-[100px] text-white px-4 sm:px-6 lg:px-10 py-10">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold mb-8 text-center"
      >
        Overall Performance Dashboard
      </motion.h1>

      {/* Overview Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {[
          { title: "Total Interviews", value: overview.totalInterviews },
          { title: "Avg Overall", value: overview.avgOverall },
          { title: "Avg Confidence", value: overview.avgConfidence },
          { title: "Avg Communication", value: overview.avgCommunication },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-5 sm:p-6 bg-gray-800/60 border border-gray-700 shadow-lg rounded-2xl text-center hover:scale-[1.02] transition-all">
              <h2 className="text-gray-400 text-sm sm:text-base">
                {item.title}
              </h2>
              <p className="text-xl sm:text-2xl font-semibold mt-2 text-blue-400">
                {item.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Line Chart */}
        <Card className="p-5 sm:p-6 bg-gray-800/60 border border-gray-700 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-300">
            Performance Trend
          </h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.trendData}>
                <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#222", border: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#60a5fa"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart */}
        <Card className="p-5 sm:p-6 bg-gray-800/60 border border-gray-700 rounded-2xl">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-300">
            Skill Distribution
          </h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.skillDistribution}>
                <XAxis dataKey="skill" stroke="#aaa" fontSize={12} />
                <YAxis stroke="#aaa" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#222", border: "none" }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Radar Chart */}
      <Card className="p-5 sm:p-6 bg-gray-800/60 border border-gray-700 rounded-2xl mb-10">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-300">
          Category Performance
        </h2>
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={charts.categoryStats}>
              <PolarGrid stroke="#555" />
              <PolarAngleAxis dataKey="category" stroke="#aaa" />
              <Radar
                name="Average Score"
                dataKey="avgScore"
                stroke="#60a5fa"
                fill="#60a5fa"
                fillOpacity={0.5}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Reports */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center text-white">
          Recent Interview Reports
        </h2>

        <div className="flex flex-col gap-4">
          {recentReports.map((r: any, idx: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-4 sm:p-5 bg-gray-800/60 border border-gray-700 rounded-2xl hover:bg-gray-800 transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">
                      {r.candidateName}
                    </h3>
                    <p className="text-gray-400 text-sm">{r.jobRole}</p>
                    <p className="mt-2 text-gray-300 text-sm sm:text-base">
                      {r.summary}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Date: {r.date}</p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1">
                    <p className="text-blue-400 font-medium text-sm sm:text-base">
                      Overall: {r.overallScore}/10
                    </p>
                    <p className="text-green-400 font-medium text-sm sm:text-base">
                      Confidence: {r.confidenceScore}/10
                    </p>
                    <p
                      className={`mt-2 text-xs sm:text-sm px-3 py-1 rounded-full ${
                        r.recommendation === "Yes"
                          ? "bg-green-600/40 text-green-300"
                          : "bg-red-600/40 text-red-300"
                      }`}
                    >
                      {r.recommendation === "Yes"
                        ? "Recommended"
                        : "Not Recommended"}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
