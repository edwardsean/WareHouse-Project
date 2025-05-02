"use client"; // Necessary for useEffect and animations

import { useState, useEffect } from "react";
import Link from "next/link";
// import { useRouter } from 'next/navigation'; // Not needed for simple links

// No ArrowLeftIcon needed for the homepage

export default function Home() {
  // State and Effect for animation (copied from other pages)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation classes (copied from other pages)
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5"; // Starting slightly lower

  // Background image path (assuming same theme means same background)
  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg"; // Ensure this path is correct

  return (
    // --- Root Element: Apply the themed background ---
    // This is where the returned JSX must start immediately after (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* Inner container for centering and max-width */}
      {/* Using max-w-lg for potentially more content than sign-in forms */}
      <div
        className={`
          relative z-10 w-full max-w-lg 
          text-center
          space-y-10 
          ${
            /* Apply animation to this main content block */ animationBaseClass
          } ${isMounted ? animationActiveClass : animationInitialClass}`}
        // Base animation delay for the whole content block
        style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
      >
        {/* --- Slogan/Main Heading: Apply themed gradient --- */}
        {/* Apply separate animation delay for staggered effect */}
        <h1
          className={
            `
            text-4xl sm:text-5xl font-bold tracking-tight text-transparent
            bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400
             ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }` /* Separate animation */
          }
          style={{ transitionDelay: isMounted ? "200ms" : "0ms" }} // Delayed after container
        >
          Revolutionize Your Product Management
        </h1>
        {/* --- Subtitle/Supporting Text --- */}
        {/* Apply separate animation delay */}
        <p
          className={
            `
            text-lg sm:text-xl text-gray-300 
            ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }` /* Separate animation */
          }
          style={{ transitionDelay: isMounted ? "300ms" : "0ms" }} // Delayed after slogan
        >
          A streamlined platform designed for seamless transactions and powerful
          insights for both customers and employees.
        </p>
        {/* --- Call-to-Action (CTA) Buttons Container --- */}
        {/* Use flex for horizontal alignment on larger screens, stack on small */}
        {/* Apply animation to the container or individual buttons */}
        <div
          className={`flex flex-col sm:flex-row justify-center gap-6 ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "400ms" : "0ms" }} // Delayed after subtitle
        >
          {/* Customer Sign In Button */}
          {/* Reusing themed button style */}
          <Link
            href="/auth/customer/signin"
            className={`
                  group relative flex items-center justify-center rounded-lg
                  px-8 py-3 text-lg font-semibold text-white shadow-lg 
                  bg-gradient-to-r from-blue-600 to-cyan-600
                  transition-all duration-300 ease-out
                  hover:from-blue-500 hover:to-cyan-500 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-lg
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                 `}
          >
            Customer Sign In
          </Link>

          {/* Employee Sign In Button */}
          {/* Reusing themed button style */}
          <Link
            href="/auth/employee/signin"
            className={`
                  group relative flex items-center justify-center rounded-lg
                  px-8 py-3 text-lg font-semibold text-white shadow-lg
                  bg-gradient-to-r from-emerald-600 to-teal-600 
                  transition-all duration-300 ease-out
                   hover:from-emerald-500 hover:to-teal-500 hover:scale-105 hover:shadow-emerald-500/50 hover:shadow-lg
                  focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-emerald-500/70 
                 `}
          >
            Employee Sign In
          </Link>
        </div>{" "}
        {/* End CTA buttons container */}
        {/* Optional: Link to explore registration/features (if needed) */}
        {/* Applied themed link style and animation */}
        <div
          className={`pt-6 text-base ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "500ms" : "0ms" }} // Delayed after buttons
        >
          {/* Assuming you might have register pages directly from here, or maybe a central auth selection page */}
          {/* Link to the auth selection page as a secondary action */}
          <Link
            href="/auth/signin"
            className="
                  font-medium text-blue-400 transition duration-300 ease-in-out
                  hover:text-blue-300 hover:underline
                  focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded
                 "
          >
            New User?{" "}
            <span className="font-semibold">Explore Sign-Up Options</span>{" "}
            {/* Link to the main auth selection */}
          </Link>
        </div>
      </div>{" "}
      {/* End inner centering container */}
    </div> // End Root Element
  );
}
