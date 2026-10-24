import type { Metadata } from "next";
import { InterviewApp } from "./interview-app";

export const metadata: Metadata = {
  title: "模擬面試",
};

export default function InterviewPage() {
  return <InterviewApp />;
}
