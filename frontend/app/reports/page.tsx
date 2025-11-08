"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStrapi } from "@/lib/api/useStrapi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import InterviewReport from "./ReportUi";

export default function ReportsPage() {
  const { data: user } = useSession<any>();
  const router = useRouter();
  const { data, error, isLoading } = useStrapi("interviews", {
    filters: { user: user?.user?.id },
    sort: ["createdAt:desc"],
  });

  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const interviews: any[] = data?.data || [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400">
        Loading interview reports...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-400">
        Failed to load reports. Please refresh.
      </div>
    );

  return (
    <main className="min-h-screen  text-gray-200 p-6 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-10 pt-15 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interview Reports
          </h1>
          <p className="text-gray-400 mt-2">
            Review your past AI-conducted interviews and performance reports.
          </p>
        </header>

        <AnimatePresence>
          {interviews.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 py-20"
            >
              No reports available yet.
            </motion.div>
          ) : (
            <motion.div
              key="list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {interviews.map((interview, idx) => (
                <motion.div
                  key={interview.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-[#1e293b]/80 border border-gray-700 hover:border-indigo-500 transition-all duration-300 shadow-xl backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-indigo-400">
                        {interview.details || "Untitled Interview"}
                      </p>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          <span className="font-medium text-gray-300">
                            Mode:
                          </span>{" "}
                          {interview.mode}
                        </p>
                        <p>
                          <span className="font-medium text-gray-300">
                            Difficulty:
                          </span>{" "}
                          {interview.difficulty}
                        </p>
                        <p>
                          <span className="font-medium text-gray-300">
                            Skills:
                          </span>{" "}
                          {interview.skills}
                        </p>
                        <p>
                          <span className="font-medium text-gray-300">
                            Questions:
                          </span>{" "}
                          {interview.numberOfQuestions}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                      <Button
                        variant="default"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                        onClick={() => {
                          try {
                            const parsed =
                              typeof interview.report === "string"
                                ? JSON.parse(interview.report)
                                : interview.report;
                            setSelectedReport(parsed);
                          } catch (e) {
                            alert("Invalid report format");
                          }
                        }}
                      >
                        View Report
                      </Button>
                      <Button
                        variant="secondary"
                        className="border-gray-600 text-gray-300  w-full sm:w-auto"
                        onClick={() =>
                          router.push(`/interview/${interview.documentId}`)
                        }
                      >
                        Retake Interview
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* REPORT MODAL */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="max-w-6xl h-[90vh] bg-[#0f172a] text-gray-200 border border-gray-700 shadow-2xl rounded-2xl overflow-hidden p-0">
          <DialogHeader className="p-6 border-b border-gray-700 bg-[#1e293b]/70 backdrop-blur">
            <DialogTitle className="text-xl font-bold text-indigo-400">
              Interview Report
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto h-full">
            {selectedReport ? (
              <InterviewReport report={selectedReport} />
            ) : (
              <div className="p-10 text-center text-gray-400">
                No report data found.
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t border-gray-700 bg-[#1e293b]/70">
            <Button
              onClick={() => setSelectedReport(null)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
