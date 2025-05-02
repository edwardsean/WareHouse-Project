"use client";

import { useState, useEffect } from "react"; // Added useEffect
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addWarehouse } from "@/app/actions/warehouse"; // Assumed correct import
import Navbar from "@/app/components/navbar";

// Interface for form validation errors (Keep as is)
interface FormErrors {
  warehousename?: string;
  address?: string;
  city?: string;
}

// Simple Arrow Left Icon (Copied from previous example)
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

export default function AddWarehouse() {
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); // For animation

  // --- Reusable Class Strings for Tailwind (Defined INSIDE the component) ---
  const inputBaseClasses =
    "appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm text-base bg-black/40 text-gray-100 placeholder-gray-500 focus:outline-none transition duration-200";
  const inputBorderNormal =
    "border border-white/20 focus:border-blue-500/50 focus:ring-blue-500/70 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const inputBorderError =
    "border border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const errorTextClasses = "mt-1.5 text-xs text-red-400 text-left";
  const buttonPrimaryBaseClasses =
    "group relative flex w-full items-center justify-center gap-x-3 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80";
  const buttonPrimaryGradient =
    "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 focus:ring-blue-500/70";
  const buttonPrimaryClasses = `${buttonPrimaryBaseClasses} ${buttonPrimaryGradient}`;
  // Helper to combine classes
  function getInputClassName(isError?: boolean) {
    return `${inputBaseClasses} ${
      isError ? inputBorderError : inputBorderNormal
    }`;
  }
  // Select needs slight adjustments for dark mode compatibility
  const selectClassName = `${inputBaseClasses} ${inputBorderNormal} pr-10`; // Add padding for default arrow
  const selectErrorClassName = `${inputBaseClasses} ${inputBorderError} pr-10`;
  // -----------------------------------------------------------------------

  // Animation classes (from theme)
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validation Logic (Keep as is)
  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {};
    const warehousename = formData.get("warehousename") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;

    // Require fields client-side before length check
    if (!warehousename || warehousename.trim().length === 0)
      errors.warehousename = "Warehouse name is required.";
    else if (warehousename.length > 20)
      errors.warehousename = "Name must be 20 characters or less.";

    if (!address || address.trim().length === 0)
      errors.address = "Address is required.";
    else if (address.length > 50)
      errors.address = "Address must be 50 characters or less.";

    if (!city || city.trim().length === 0) errors.city = "City is required.";
    else if (city.length > 20)
      errors.city = "City must be 20 characters or less.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Form Submission Logic
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Use event for client-side onSubmit
    setError(null);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const isValid = await validateForm(formData);
    if (!isValid) {
      setError("Please correct the errors below.");
      return;
    }

    try {
      const result = await addWarehouse(formData); // Call the server action
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/warehouse"); // Redirect on success
      }
    } catch (err) {
      console.error("Failed to add warehouse:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    // --- Root Element with Dark Gradient Theme ---
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
      <Navbar /> {/* Navbar Included */}
      {/* --- Main Content Area --- */}
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {/* --- Animation Container --- */}
        <div
          className={`relative z-10 w-full max-w-lg ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* --- Back Link --- */}
          <div className="mb-6">
            <Link
              href="/warehouse"
              className={`inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition duration-300 ease-in-out hover:text-white focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded`}
              // Animation delay can be adjusted or removed if container handles it
              // style={{ transitionDelay: isMounted ? "150ms" : "0ms" }}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Warehouses</span>
            </Link>
          </div>
          {/* --- Form Content Container (Glass Card Effect) --- */}
          <div className="space-y-6 border border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-md">
            {/* --- Themed Title --- */}
            <h2
              className={`
                   text-center text-2xl sm:text-3xl font-bold tracking-tight text-transparent
                  bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 sm:mb-8
                 `}
            >
              Add New Warehouse
            </h2>
            {/* --- Form --- */}
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {/* Warehouse Name */}
              <div className="relative">
                <label
                  htmlFor="warehousename"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Warehouse Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="warehousename"
                  id="warehousename"
                  required
                  maxLength={20}
                  className={getInputClassName(!!formErrors.warehousename)}
                  placeholder="e.g., Main Distribution Center"
                />
                {formErrors.warehousename && (
                  <p className={errorTextClasses}>{formErrors.warehousename}</p>
                )}
              </div>

              {/* Address */}
              <div className="relative">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  maxLength={50}
                  className={getInputClassName(!!formErrors.address)}
                  placeholder="e.g., 123 Industrial Ave"
                />
                {formErrors.address && (
                  <p className={errorTextClasses}>{formErrors.address}</p>
                )}
              </div>

              {/* City */}
              <div className="relative">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  required
                  maxLength={20}
                  className={getInputClassName(!!formErrors.city)}
                  placeholder="e.g., Metropolis"
                />
                {formErrors.city && (
                  <p className={errorTextClasses}>{formErrors.city}</p>
                )}
              </div>

              {/* --- General Error Display --- */}
              {error && (
                <p className="text-sm text-center text-red-400 pt-2">{error}</p>
              )}

              {/* --- Submit Button --- */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`${buttonPrimaryClasses} w-full`}
                >
                  Add Warehouse
                </button>
              </div>
            </form>{" "}
            {/* End Form */}
          </div>{" "}
          {/* End Form Content Container */}
        </div>{" "}
        {/* End Animation Container */}
      </main>{" "}
      {/* End Main */}
    </div> // End Root
  );
}
