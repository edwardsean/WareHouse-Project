"use client"; // Keep this

import Link from "next/link";
import { useState, useEffect } from "react"; // Needed for staggered animation effect

// --- SVG Icon Components (Defined Above or Imported) ---
// Assuming UserIcon and BriefcaseIcon are defined as above (with fill="none" removed)
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v4.05a2.25 2.25 0 0 1-2.25 2.25h-12a2.25 2.25 0 0 1-2.25-2.25v-4.05m16.5 0a2.25 2.25 0 0 0-2.25-2.25h-12a2.25 2.25 0 0 0-2.25 2.25m16.5 0v-4.05a2.25 2.25 0 0 0-2.25-2.25h-12a2.25 2.25 0 0 0-2.25 2.25V14.15m16.5 0a2.25 2.25 0 0 0 2.25 2.25h1.5v-4.05a2.25 2.25 0 0 0-2.25-2.25H8.25m12 2.25h-1.5m-1.5 0h-9"
    />
  </svg>
);
// --------------------------------------------

// This is the SignInSelect component (where users choose Customer or Employee)
export default function SignInSelect() {
  // State to control rendering for staggered animation effect
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Base classes for animation
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // --- Define Image Path ---
  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg"; // Assuming image is in public folder now

  return (
    // Root Element: Image background with overlay
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* Inner container */}
      <div
        className={`
          relative z-10 w-full max-w-xs space-y-10 text-center
        `}
      >
        {/* Title */}
        <h2
          className={`
            text-4xl font-bold tracking-tight text-transparent
            bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400
            ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }
          `}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          Sign in as
        </h2>

        {/* Button Container */}
        <div
          className={`
            flex flex-col space-y-5
            ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }
          `}
          style={{ transitionDelay: isMounted ? "250ms" : "0ms" }}
        >
          {/* Customer Button */}
          <Link
            href="/auth/customer/signin"
            // NOTE: Added 'group' class here to enable group-hover on children
            className={`
              group relative flex w-full items-center justify-center gap-x-3 rounded-lg
              px-6 py-3.5 text-base font-semibold text-white shadow-lg backdrop-blur-[1px] bg-white/5
              border border-white/10
              transition-all duration-300 ease-out
              hover:scale-[1.05] hover:bg-white/10 hover:border-white/20 hover:shadow-blue-500/50 hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
            `}
          >
            {/* UPDATED Icon: Added group-hover styles */}
            <UserIcon
              className={`
                h-5 w-5 transition-all duration-300
                text-white                 
                group-hover:scale-110       
                group-hover:fill-cyan-400   
                group-hover:stroke-cyan-400  
                group-hover:[filter:drop-shadow(0_0_3px_#67e8f9)] ${
                  /* Cyan glow (Tailwind cyan-300 hex) */ ""
                }
             `}
            />
            <span>Customer</span>
          </Link>

          {/* Employee Button */}
          <Link
            href="/auth/employee/signin"
            // NOTE: Added 'group' class here
            className={`
              group relative flex w-full items-center justify-center gap-x-3 rounded-lg
              px-6 py-3.5 text-base font-semibold text-white shadow-lg backdrop-blur-[1px] bg-white/5
              border border-white/10
              transition-all duration-300 ease-out
              hover:scale-[1.05] hover:bg-white/10 hover:border-white/20 hover:shadow-emerald-500/50 hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-emerald-500/70
            `}
          >
            {/* UPDATED Icon: Added group-hover styles */}
            <BriefcaseIcon
              className={`
                h-5 w-5 transition-all duration-300
                text-white                     
                group-hover:scale-110         
                group-hover:fill-emerald-400    
                group-hover:stroke-emerald-400  
                group-hover:[filter:drop-shadow(0_0_4px_#34d399)] ${
                  /* Emerald glow (Tailwind emerald-400 hex) */ ""
                }
            `}
            />
            <span>Employee</span>
          </Link>
        </div>

        {/* Return to Home Link */}
        <div
          className={`
            pt-6
             ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }
          `}
          style={{ transitionDelay: isMounted ? "400ms" : "0ms" }}
        >
          <Link
            href="/"
            className="
              text-sm font-medium text-gray-400
              transition duration-300 ease-in-out
              hover:text-gray-100 hover:underline
              focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded
            "
          >
            ← Return to Home
          </Link>
        </div>
      </div>{" "}
      {/* End Inner container */}
    </div> // End Root Element
  );
}
