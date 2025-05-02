"use client"; // Ensure client-side functionality

import { useState, useEffect } from "react"; // Import useEffect for mount animation
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleEmployeeSignUp } from "@/app/actions/employeeAuth"; // Keep specific auth action

// Simple Arrow Left Icon (copied from themed versions)
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

// Type definition for form errors (updated to include all fields)
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string; // Although validation not in original func, adding for consistency
  phoneNumber?: string;
  password?: string;
  bankNumber?: string;
  warehouseid?: string; // Use this key consistently
  code?: string;
}

export default function EmployeeRegister() {
  const [error, setError] = useState<string | null>(null); // For general API errors
  const [formErrors, setFormErrors] = useState<FormErrors>({}); // For client-side validation errors
  const router = useRouter();

  // State and Effect for animation (copied from themed versions)
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation classes (copied from themed versions)
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // Background image path (assuming same theme means same background)
  const backgroundImagePath = "/pexels-tiger-lily-4483610.jpg"; // Ensure this path is correct

  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {};

    // Retrieve all relevant field values
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string; // Optional
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string; // Optional
    const bankNumber = formData.get("bankNumber") as string; // Optional
    const password = formData.get("password") as string;
    const warehouseid = formData.get("warehouseid") as string; // Correctly gets value now
    const code = formData.get("code") as string;

    // --- Required Fields Check ---
    if (!firstName) errors.firstName = "First name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!warehouseid) errors.warehouseid = "Warehouse ID is required"; // Uses warehouseid key
    if (!code) errors.code = "Registration code is required";

    // --- Format Validations ---
    if (
      email &&
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)
    ) {
      errors.email = "Please enter a valid email address";
    }

    if (phoneNumber && phoneNumber.length < 10) {
      // You had correct logic here already
      errors.phoneNumber = "Phone number must be 10 digits";
    }

    if (bankNumber && !/^\d+$/.test(bankNumber)) {
      errors.bankNumber = "Bank number must contain only digits";
    }

    if (password && password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (code && code !== "123") {
      // Assuming '123' is placeholder logic
      errors.code = "Invalid registration code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);

    const isValid = await validateForm(formData);
    if (!isValid) return;

    const formDataToSend = new FormData();
    for (const [key, value] of formData.entries()) {
      if (key !== "code") {
        // Don't send registration code to backend action
        formDataToSend.append(key, value);
      }
    }

    const result = await handleEmployeeSignUp(formDataToSend);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push("/auth/verify"); // Or your desired redirect route
    } else {
      setError("An unexpected error occurred during registration.");
    }
  }

  // --- Component Render ---
  return (
    <div // Root element
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-gray-100 p-4 bg-black bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${backgroundImagePath})`,
      }}
    >
      {/* --- Back Link --- */}
      <div
        className={`absolute top-6 left-6 z-30 ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "0ms" : "0ms" }}
      >
        <Link
          href="/auth/employee/signin" // Corrected link assuming this page is /auth/employee/register
          className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition duration-300 ease-in-out hover:text-white hover:scale-105 focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded p-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>
      {/* --- Inner Container --- */}
      <div
        className={`relative z-10 w-full max-w-md space-y-8 mt-24 ${animationBaseClass} ${
          isMounted ? animationActiveClass : animationInitialClass
        }`}
        style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
      >
        {/* --- Form Content Container --- */}
        <div className="space-y-6 text-center">
          {/* --- Title --- */}
          <h2
            className={`text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400`}
          >
            Register as Employee
          </h2>

          {/* --- Form --- */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* --- Inputs Block --- */}
            <div className="space-y-4">
              {/* First Name Input */}
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.firstName ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="First Name"
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
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
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.lastName ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Last Name (optional)"
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
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
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.email ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Email address"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Number Input */}
              <div>
                <label htmlFor="phoneNumber" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel" // Use type="tel" for phone numbers
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.phoneNumber
                      ? "border-red-500"
                      : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Phone Number (optional)"
                />
                {formErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Bank Number Input */}
              <div>
                <label htmlFor="bankNumber" className="sr-only">
                  Bank Account Number
                </label>
                <input
                  id="bankNumber"
                  name="bankNumber"
                  type="text" // Changed to text; use pattern for validation if needed
                  inputMode="numeric" // Hint for mobile keyboards
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.bankNumber ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Bank Account Number (optional)"
                />
                {formErrors.bankNumber && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.bankNumber}
                  </p>
                )}
              </div>

              {/* =========================================== */}
              {/* ===== CORRECTED WAREHOUSE ID INPUT ====== */}
              {/* =========================================== */}
              <div>
                <label htmlFor="warehouseid" className="sr-only">
                  Warehouse ID
                </label>
                <input
                  id="warehouseid" // Correct ID
                  name="warehouseid" // *** Correct NAME ***
                  type="text" // Can be number if ONLY numbers expected
                  required
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.warehouseid
                      ? "border-red-500"
                      : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Assigned Warehouse ID"
                />
                {formErrors.warehouseid && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.warehouseid}
                  </p>
                )}
              </div>
              {/* =========================================== */}
              {/* =========================================== */}

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
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.password ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Employee Registration Code Input */}
              <div>
                <label htmlFor="code" className="sr-only">
                  Registration Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="password" // Masking the code input
                  required
                  className={`appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm bg-black/30 border ${
                    formErrors.code ? "border-red-500" : "border-white/20"
                  } text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 transition duration-200`}
                  placeholder="Employee Registration Code"
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-left pl-1 text-red-400">
                    {formErrors.code}
                  </p>
                )}
              </div>
            </div>{" "}
            {/* End inputs block */}
            {/* --- General API Error Message --- */}
            {error && (
              <div
                className={`text-red-400 text-sm text-center py-2 ${animationBaseClass} ${
                  isMounted ? animationActiveClass : animationInitialClass
                }`}
                style={{ transitionDelay: isMounted ? "450ms" : "0ms" }}
              >
                {error}
              </div>
            )}
            {/* --- Submit Button --- */}
            <div>
              <button
                type="submit"
                className={`group relative flex w-full items-center justify-center gap-x-3 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ease-out hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70 ${animationBaseClass} ${
                  isMounted ? animationActiveClass : animationInitialClass
                }`}
                style={{ transitionDelay: isMounted ? "500ms" : "0ms" }}
              >
                Register
              </button>
            </div>
          </form>

          {/* --- Sign In Link --- */}
          <div
            className={`pt-4 text-sm text-center ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }`}
            style={{ transitionDelay: isMounted ? "600ms" : "0ms" }}
          >
            <Link
              href="/auth/employee/signin"
              className="font-medium text-blue-400 transition duration-300 ease-in-out hover:text-blue-300 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-400/50 rounded"
            >
              Already have an account?{" "}
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
