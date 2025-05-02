"use client"; // Ensure client-side functionality

import { useState, useEffect } from "react"; // Import useEffect for mount animation
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleSignUp } from "@/app/actions/auth"; // Keep specific auth action

// Simple Arrow Left Icon (copied from sign-in versions)
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

// Type definition for form errors (copied from original)
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  bankAccount?: string; // Assuming this is required and potentially sensitive
  password?: string;
}

export default function CustomerRegister() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null); // For general API errors
  const [formErrors, setFormErrors] = useState<FormErrors>({}); // For client-side validation errors

  // State and Effect for animation (copied from sign-in versions)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation classes (copied from sign-in versions)
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // Background image path (assuming same theme means same background)
  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg"; // Ensure this path is correct

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {};

    // Retrieve values
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const bankAccount = formData.get("bankAccount") as string; // Assuming bank account is required
    const password = formData.get("password") as string;

    // Basic required fields check
    if (!firstName) errors.firstName = "First name is required";
    if (!lastName) errors.lastName = "Last name is required";
    if (!bankAccount) errors.bankAccount = "Bank Account is required";

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate bank account format (optional from original, making required based on label presence)
    if (bankAccount && !/^\d+$/.test(bankAccount)) {
      errors.bankAccount = "Bank account must contain only digits";
    } else if (bankAccount.length < 10) {
      // Add a minimum length check for typical bank accounts
      errors.bankAccount = "Bank account seems too short";
    }

    // Validate password (minimum requirements)
    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Using onSubmit event handler instead of form action
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevent default form submission
    setError(null); // Clear general API errors
    setFormErrors({}); // Clear client-side errors
    const formData = new FormData(event.currentTarget);

    const isValid = await validateForm(formData);
    if (!isValid) return; // Stop if client-side validation fails

    const result = await handleSignUp(formData);
    if (result?.error) {
      setError(result.error); // Display API error
    } else if (result?.success) {
      router.push("/auth/verify"); // Redirect on success (adjust as needed)
    }
  }

  // --- Component Render ---

  // Apply the themed background as the root element
  // Ensure the opening div is RIGHT AFTER the opening parenthesis (
  return (
    <div // This is where the returned JSX must start immediately after (
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* --- Back Link (Positioned Top Left - copied from sign-in) --- */}
      {/* Placed as a direct child of the root div for correct positioning relative to screen */}
      <div
        className={`absolute top-6 left-6 z-30 ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "0ms" : "0ms" }}
      >
        <Link
          href="/auth/customer/signin" // Link back to the customer sign-in page
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
      {/* Inner container for centering and max-width (copied & adjusted) */}
      {/* Added margin top to clear the absolute back button area */}
      {/* Applied animation to this container */}
      <div
        className={`
          relative z-10 w-full max-w-sm space-y-8 
          mt-16 
          ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "100ms" : "0ms" }} // Applied animation delay
      >
        {/* Container for the main form content (remains as is mostly) */}
        <div className="space-y-6 text-center">
          {" "}
          {/* No animation here, controlled by parent */}
          {/* --- Title: Apply themed gradient (copied) --- */}
          <h2
            className={`
              text-3xl font-bold tracking-tight text-transparent
              bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400
            `}
          >
            Create your account {/* Kept the original title text */}
          </h2>
          {/* --- Form --- */}
          {/* Changed from action={onSubmit} to onSubmit={onSubmit} to use state for errors */}
          <form onSubmit={onSubmit} className="space-y-5">
            {" "}
            {/* Uses space-y-5 as in sign-in */}
            {/* --- Inputs Block --- */}
            {/* Uses space-y-4 as in sign-in */}
            {/* Note: original used rounded-md shadow-sm on this div, removed to match themed input style */}
            <div className="space-y-4">
              {/* First Name Input */}
              <div>
                {" "}
                {/* Each input often benefits from its own container div for spacing/errors */}
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  // Applied themed input classes. Border is default white/20 unless handled below
                  className={`
                    appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-white/20"
                    }
                    text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                     transition duration-200
                  `}
                  placeholder="First Name"
                />
                {/* Themed error message below input */}
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name Input */}
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  // Applied themed input classes. Border is default white/20 unless handled below
                  className={`
                    appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border ${
                      formErrors.lastName ? "border-red-500" : "border-white/20"
                    }
                    text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                    transition duration-200
                  `}
                  placeholder="Last Name"
                />
                {/* Themed error message below input */}
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.lastName}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  // Applied themed input classes with conditional border
                  className={`
                     appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border ${
                      formErrors.email ? "border-red-500" : "border-white/20"
                    }
                    text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                    transition duration-200
                  `}
                  placeholder="Email address"
                />
                {/* Themed error message below input */}
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Bank Account Input */}
              {/* Original was optional, making it required here based on label & input presence */}
              <div>
                <label htmlFor="bankAccount" className="sr-only">
                  Bank Account
                </label>
                <input
                  id="bankAccount"
                  name="bankAccount"
                  type="text"
                  required // Mark required based on validation function update
                  // Applied themed input classes with conditional border
                  className={`
                     appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border ${
                      formErrors.bankAccount
                        ? "border-red-500"
                        : "border-white/20"
                    }
                    text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                    transition duration-200
                  `}
                  placeholder="Bank Account"
                />
                {/* Themed error message below input */}
                {formErrors.bankAccount && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.bankAccount}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  // Applied themed input classes with conditional border
                  className={`
                     appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm
                    bg-black/30 border ${
                      formErrors.password ? "border-red-500" : "border-white/20"
                    }
                    text-gray-100 placeholder-gray-400
                    focus:outline-none focus:border-blue-500/50
                    focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70
                    transition duration-200
                  `}
                  placeholder="Password"
                />
                {/* Themed error message below input */}
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>
            {/* --- General API Error Message (copied & adjusted) --- */}
            {/* Separate from formErrors, typically shown at the top/bottom of the form */}
            {/* Applied animation and delay */}
            {error && (
              <div
                className={`text-red-400 text-sm text-center ${animationBaseClass} ${
                  isMounted ? animationActiveClass : animationInitialClass
                }`}
                // Delay slightly after inputs, before button
                style={{ transitionDelay: isMounted ? "350ms" : "0ms" }}
              >
                {error}
              </div>
            )}
            {/* --- Submit Button: Apply themed style (copied) --- */}
            {/* Applied animation and delay */}
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
                // Animation delay
                style={{ transitionDelay: isMounted ? "400ms" : "0ms" }}
              >
                Register {/* Keep register button text */}
              </button>
            </div>
          </form>
          {/* --- Sign In Link: Apply themed style (copied & adjusted text) --- */}
          {/* Applied animation and delay */}
          <div
            className={`
              pt-4 text-sm text-center
              ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }
            `}
            // Animation delay
            style={{ transitionDelay: isMounted ? "500ms" : "0ms" }}
          >
            <Link
              href="/auth/customer/signin" // Link back to customer sign-in
              className="
                  font-medium text-blue-400 transition duration-300 ease-in-out
                  hover:text-blue-300 hover:underline
                  focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded
                 "
            >
              Already have an account? {/* Keep register text */}
              <span className="font-semibold">Sign in</span>
            </Link>
          </div>
        </div>{" "}
        {/* End form content container */}
      </div>{" "}
      {/* End inner centering container */}
    </div> // End Root Element
  );
}
