import { Suspense } from "react";
import OnboardingClient from "./onboarding-client";

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0EA] flex items-center justify-center">
        <div className="text-[#6B6B6B]">Loading...</div>
      </div>
    }>
      <OnboardingClient />
    </Suspense>
  );
}
