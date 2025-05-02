"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleSignIn } from "@/app/actions/auth"; // Assuming this is correctly imported

// Simple Arrow Left Icon
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

export default function CustomerSignIn() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await handleSignIn(formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push("/product");
    }
  }

  return (
    // --- Root Element: Apply the themed background ---
    // Ensure the opening div is RIGHT AFTER the opening parenthesis (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* --- Back Link (Positioned Top Left) --- */}
      {/* Moved OUTSIDE the inner centering container */}
      <div
        // Corrected positioning and moved to the root div context
        className={`absolute top-6 left-6 z-30 ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "0ms" : "0ms" }}
      >
        <Link
          href="/auth/signin" // Link back to the selection page
          className="
              flex items-center gap-1.5 text-sm font-medium text-gray-300
              transition duration-300 ease-in-out
              hover:text-white hover:scale-105
              focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded p-1
            "
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>
      {/* Inner container for centering and max-width */}
      <div
        className={`
          relative z-10 w-full max-w-sm space-y-8
          mt-16 
        `}
        // Added mt-16 here to push content below the back button
      >
        {/* Container for the main form content */}
        <div
          className={`space-y-6 text-center ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* --- Title: Apply themed gradient --- */}
          <h2
            className={`
              text-3xl font-bold tracking-tight text-transparent
              bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400
            `}
          >
            Sign in to your account
          </h2>

          {/* --- Form --- */}
          <form onSubmit={onSubmit} className="space-y-5">
            {/* --- Inputs: Themed for dark background --- */}
            <div className="space-y-4">
              <input
                name="email"
                type="email"
                required
                className={`
                    appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border border-white/20 text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                     transition duration-200
                  `}
                placeholder="Email address"
              />
              <input
                name="password"
                type="password"
                required
                className={`
                    appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border border-white/20 text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                    transition duration-200
                  `}
                placeholder="Password"
              />
            </div>

            {/* --- Error Message --- */}
            {error && (
              <div
                className={`text-red-400 text-sm ${animationBaseClass} ${
                  isMounted ? animationActiveClass : animationInitialClass
                }`}
                style={{ transitionDelay: isMounted ? "300ms" : "0ms" }}
              >
                {error}
              </div>
            )}

            {/* --- Submit Button: Apply themed style --- */}
            <div>
              <button
                type="submit"
                className={`
                  group relative flex w-full items-center justify-center gap-x-3 rounded-lg
                  px-6 py-3 text-base font-semibold text-white shadow-lg
                  bg-gradient-to-r from-blue-600 to-cyan-600
                  transition-all duration-300 ease-out
                  hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 hover:shadow-lg
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                   ${animationBaseClass} ${
                  isMounted ? animationActiveClass : animationInitialClass
                }
                 `}
                style={{ transitionDelay: isMounted ? "350ms" : "0ms" }}
              >
                Sign in
              </button>
            </div>
          </form>

          {/* --- Register Link: Apply themed style --- */}
          <div
            className={`
              pt-4 text-sm
              ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }
            `}
            style={{ transitionDelay: isMounted ? "450ms" : "0ms" }}
          >
            <Link
              href="/auth/customer/register"
              className="
                  font-medium text-blue-400 transition duration-300 ease-in-out
                  hover:text-blue-300 hover:underline
                  focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded
                 "
            >
              Don't have an account?{" "}
              <span className="font-semibold">Register</span>
            </Link>
          </div>
        </div>{" "}
        {/* End form content container */}
      </div>{" "}
      {/* End inner centering container */}
    </div> // End Root Element
  );
}
