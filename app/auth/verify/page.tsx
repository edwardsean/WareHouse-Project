"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Simple Arrow Left Icon - consistent with other pages
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

// Email Icon
const EmailIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

export default function VerifyEmail() {
  // Animation states
  const [isMounted, setIsMounted] = useState(false);

  // Animation classes - consistent with other pages
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // Background image - same as other auth pages
  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    // Root element with themed background
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* Back Link (Top Left) */}
      <div
        className={`absolute top-6 left-6 z-30 ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "0ms" : "0ms" }}
      >
        <Link
          href="/auth/signin"
          className="
            flex items-center gap-1.5 text-sm font-medium text-gray-300
            transition duration-300 ease-in-out
            hover:text-white hover:scale-105
            focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded p-1
          "
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Main Content Container */}
      <div
        className={`
          relative z-10 w-full max-w-md space-y-8 text-center mt-16
        `}
      >
        <div
          className={`space-y-8 ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-600/30 to-cyan-600/30 flex items-center justify-center border border-blue-400/20">
            <EmailIcon className="w-10 h-10 text-blue-400" />
          </div>

          {/* Title with gradient */}
          <h2
            className={`
              text-3xl font-bold tracking-tight text-transparent
              bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400
            `}
          >
            Check Your Email
          </h2>

          {/* Message */}
          <div
            className={`rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm px-6 py-8 shadow-xl ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }`}
            style={{ transitionDelay: isMounted ? "200ms" : "0ms" }}
          >
            <p className="text-gray-300 mb-6">
              We've sent you a verification email. Please check your inbox and
              click the link to verify your account.
            </p>
            <p className="text-gray-400 text-sm">
              If you don't see the email, check your spam folder or make sure
              you entered the correct email address.
            </p>
          </div>

          {/* Return to sign in link */}
          <div
            className={`pt-4 ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }`}
            style={{ transitionDelay: isMounted ? "300ms" : "0ms" }}
          >
            <Link
              href="/auth/signin"
              className="
                inline-flex items-center justify-center gap-x-2 rounded-lg
                px-5 py-2.5 text-sm font-semibold text-white shadow-lg
                bg-gradient-to-r from-blue-600 to-cyan-600
                transition-all duration-300 ease-out
                hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 hover:shadow-lg
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
              "
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
