import { Suspense } from "react";
import OnboardingClient from "./onboarding-client";

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center">
        <div className="text-[#54615d]">Loading...</div>
      </div>
    }>
      <OnboardingClient />
    </Suspense>
  );
}
