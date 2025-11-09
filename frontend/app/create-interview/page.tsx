"use client";
import Orb from "@/components/Orb";
import TrueFocus from "@/components/TrueFocus";
import Stepper, { Step } from "@/components/ui/stepper";
import { strapi } from "@/lib/api/sdk";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const [candidateName, setCandidateName] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [mode, setMode] = useState("Technical");
  const [difficulty, setDifficulty] = useState("medium");
  const [skills, setSkills] = useState("");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState("10");
  const [loading, setLoading] = useState(false);

  const { data } = useSession<any>();
  const router = useRouter();

  // 🔹 Upload immediately when file changes
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResume(file);
    toast.loading("Uploading file...", { id: "upload" });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const uploadedUrl = json.result;

      if (uploadedUrl) {
        setResumeUrl(uploadedUrl);
        const AI_RES = await fetch("/api/resume-extractor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: uploadedUrl },
                  },
                ],
              },
            ],
          }),
        });
        const aiData = await AI_RES.json();

        if (aiData) {
          setCandidateName(aiData.candidateName || "");
          setSkills(aiData.skills || "");
          setTopic(aiData.topic || "");
          setDifficulty(aiData.difficulty || "medium");
          setMode(aiData.mode || "Technical");
        }

        console.log("AI Resume Extraction:", aiData);
        toast.success("Resume uploaded successfully", { id: "upload" });
      } else {
        toast.error("File upload failed", { id: "upload" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading file", { id: "upload" });
    }
  };

  const handleSubmitFinal = async () => {
    try {
      setLoading(true);

      if (!candidateName) return toast.error("Please provide candidate name");
      if (!data || !data.user) return toast.error("You must be logged in");
      if (!mode) return toast.error("Please select interview mode");
      if (!difficulty) return toast.error("Please select difficulty");
      if (!skills) return toast.error("Please provide skills");
      if (!topic) return toast.error("Please provide job role");
      if (!questions) return toast.error("Please select number of questions");

      // 🔹 Directly use uploaded file URL
      const res = await strapi.create("interviews", {
        resume: resumeUrl || null,
        mode,
        difficulty,
        skills: skills.split(" ").join(","),
        details: topic,
        numberOfQuestions: parseInt(questions),
        user: data?.user?.id,
        candidateName,
      });

      toast.success("Interview Created Successfully");
      router.push(`/interview/${res.data.documentId}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- STYLES ---
  const PrimaryBlue = "blue-500";
  const InputClasses = `p-3 w-full bg-white text-gray-900 rounded-lg border border-${PrimaryBlue} focus:ring-2 focus:ring-${PrimaryBlue} focus:border-${PrimaryBlue} transition duration-150 ease-in-out shadow-md`;
  const SelectClasses = `${InputClasses} appearance-none`;
  const LabelClasses = "block font-semibold mb-2 text-sky-400 text-base";
  const CardClasses = "p-6 md:p-8 bg-transparent rounded-xl shadow-lg mb-6";
  const FileInputClasses = `w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-800 file:text-sky-300 hover:file:bg-blue-700`;

  return (
    <>
      {loading ? (
        <div className="flex justify-center flex-col gap-8 items-center w-full h-[80vh]">
          <TrueFocus
            sentence="Generating Interview"
            manualMode={false}
            blurAmount={5}
            borderColor="cyan" // Blue theme accent color
            animationDuration={2}
            pauseBetweenAnimations={1}
          />
        </div>
      ) : (
        <>
          <div className="h-10" aria-hidden />

          <Stepper
            initialStep={1}
            onStepChange={(step) => {
              console.log(`Current step: ${step}`);
            }}
            onFinalStepCompleted={handleSubmitFinal}
            backButtonText="Back"
            nextButtonText="Continue"
          >
            {/* Step 1: Welcome */}
            <Step>
              <div className={CardClasses}>
                {/* Heading: Bright Sky Blue */}
                <h2 className="text-2xl font-bold text-sky-400 mb-4">
                  Welcome to the Interview!
                </h2>
                {/* Paragraph text: Light Gray for contrast */}
                <p className="text-gray-400 leading-relaxed">
                  We'll guide you through setting up your personalized AI
                  interview. This process ensures the AI tailors the questions
                  to your exact needs, skills, and career focus.
                </p>
              </div>
            </Step>

            {/* Step 2: Mode, Difficulty, and Resume Upload */}
            <Step>
              <div className={CardClasses}>
                <h2 className="text-2xl font-bold text-sky-400 mb-6">
                  Step 2: Core Setup 🛠️
                </h2>

                <div className="mb-6">
                  <label className={LabelClasses}>Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Name of the Candidate"
                    required
                    className={InputClasses}
                  />
                </div>

                <div className="mb-6">
                  <label className={LabelClasses}>
                    Upload Resume (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*" // Added pdf to accepted file types
                    className={FileInputClasses}
                  />
                  {resume && (
                    <p className="mt-2 text-sm text-lime-400">
                      Selected: **{resume.name}**
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className={LabelClasses}>Interview Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className={SelectClasses}
                  >
                    <option value="HR">HR / Behavioral</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div className="mb-2">
                  <label className={LabelClasses}>Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className={SelectClasses}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </Step>

            {/* Step 3: Skills and Topic */}
            <Step>
              <div className={CardClasses}>
                <h2 className="text-2xl font-bold text-sky-400 mb-6">
                  Step 3: Focus Area 🎯
                </h2>
                <div className="mb-6">
                  <label className={LabelClasses}>
                    Key Skills (Space/Comma separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., React, Tailwind CSS, Next.js"
                    required
                    className={InputClasses}
                  />
                  {skills.length < 1 && (
                    <p className="text-red-500 text-sm mt-1">
                      Please add at least one skill.
                    </p>
                  )}
                </div>

                <div className="mb-2">
                  <label className={LabelClasses}>Job Role</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Frontend Web Development"
                    required
                    className={InputClasses}
                  />
                  {topic.length < 1 && (
                    <p className="text-red-500 text-sm mt-1">
                      Please provide a topic/focus.
                    </p>
                  )}
                </div>
              </div>
            </Step>

            {/* Step 4: Number of Questions */}
            <Step>
              <div className={CardClasses}>
                <h2 className="text-2xl font-bold text-sky-400 mb-6">
                  Step 4: Interview Length ⏱️
                </h2>
                <label className={LabelClasses}>Number of Questions</label>
                <select
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  className={SelectClasses}
                >
                  <option value="2">2 Questions (Quick)</option>
                  <option value="5">5 Questions (Quick)</option>
                  <option value="10">10 Questions (Standard)</option>
                  <option value="15">15 Questions (Deep Dive)</option>
                  <option value="20">20 Questions (Comprehensive)</option>
                </select>
              </div>
            </Step>

            {/* Final Step */}
            <Step>
              <div className={CardClasses}>
                <h2 className="text-2xl font-bold text-sky-400 mb-4">
                  Final Step: Ready to Practice! 🎉
                </h2>
                <p className="text-gray-400 leading-relaxed mb-5">
                  You've set up your interview profile. Review the details below
                  and click **Complete** to begin your mock interview.
                </p>
              </div>
            </Step>
          </Stepper>
        </>
      )}
    </>
  );
}

export default Page;
