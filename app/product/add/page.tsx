"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { addProduct } from "@/app/actions/product"; // Assuming this action exists and is correctly typed
import Navbar from "@/app/components/navbar"; // Import the Navbar

// --- UPDATED Interface for form validation errors ---
interface FormErrors {
  name?: string;
  category?: string; // Added
  weightperunit?: string; // Added
  volumeperunit?: string; // Added
  quantity?: string; // Added
}
// ----------------------------------------------------

// Simple Arrow Left Icon (Keep as is)
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
    className="w-4 h-4" // Adjusted size to match usage
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

export default function AddProduct() {
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // --- Reusable Class Strings for Tailwind (Defined INSIDE the component) ---
  const inputBaseClasses =
    "appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm text-base bg-black/40 text-gray-100 placeholder-gray-500 focus:outline-none transition duration-200";
  const inputBorderNormal =
    "border border-white/20 focus:border-blue-500/50 focus:ring-blue-500/70 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const inputBorderError =
    "border border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const inputNumberNoSpinClasses =
    "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&]:[-moz-appearance:textfield]";
  const errorTextClasses = "mt-1.5 text-xs text-red-400 text-left"; // Added text-left
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
  function getNumberInputClassName(isError?: boolean) {
    return `${inputBaseClasses} ${
      isError ? inputBorderError : inputBorderNormal
    } ${inputNumberNoSpinClasses}`;
  }
  // -----------------------------------------------------------------------

  // Animation classes (from theme)
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // --- State and Logic Hooks (Keep as is) ---
  useEffect(() => {
    setIsMounted(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
      if (!session?.user?.email) {
        // Consider redirecting or showing a persistent error if user MUST be logged in
        console.log("AddProduct: User not logged in.");
        // setError("You must be logged in to add a product."); // Example
      }
    });
  }, []); // Removed router dependency as it's only used in onSubmit

  // --- UPDATED validateForm to include all fields ---
  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {};
    const name = formData.get("name") as string; // Use 'name' to match input field
    const category = formData.get("category") as string;
    const weightStr = formData.get("weightperunit") as string;
    const volumeStr = formData.get("volumeperunit") as string;
    const quantityStr = formData.get("quantity") as string;

    // Name Validation
    if (!name || name.trim().length === 0)
      errors.name = "Product name is required.";
    else if (name.length > 20)
      errors.name = "Name must be 20 characters or less.";

    // Category Validation
    if (!category || category.trim().length === 0)
      errors.category = "Category is required.";
    else if (category.length > 20)
      errors.category = "Category must be 20 characters or less.";

    // Weight Validation
    if (!weightStr) {
      errors.weightperunit = "Weight is required.";
    } else {
      const weight = parseFloat(weightStr);
      if (isNaN(weight)) {
        errors.weightperunit = "Weight must be a valid number.";
      } else if (weight <= 0) {
        errors.weightperunit = "Weight must be greater than 0.";
      }
    }

    // Volume Validation
    if (!volumeStr) {
      errors.volumeperunit = "Volume is required.";
    } else {
      const volume = parseFloat(volumeStr);
      if (isNaN(volume)) {
        errors.volumeperunit = "Volume must be a valid number.";
      } else if (volume <= 0) {
        errors.volumeperunit = "Volume must be greater than 0.";
      }
    }

    // Quantity Validation
    if (!quantityStr) {
      errors.quantity = "Quantity is required.";
    } else {
      const quantity = parseInt(quantityStr, 10);
      if (isNaN(quantity)) {
        errors.quantity = "Quantity must be a valid number.";
      } else if (quantity <= 0) {
        errors.quantity = "Quantity must be greater than 0.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }
  // ----------------------------------------------------

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFormErrors({});

    if (!userEmail) {
      setError("Cannot add product: User information is not available.");
      // Optionally re-check session here if needed
      return;
    }

    const formData = new FormData(event.currentTarget);
    const isValid = await validateForm(formData); // Validate first
    if (!isValid) {
      setError("Please correct the errors noted below.");
      return; // Stop submission if validation fails
    }

    // If valid, proceed with server action
    try {
      // Assuming addProduct is a server action correctly handling FormData and userEmail
      const result = await addProduct(formData, userEmail); // Pass validated data

      if (result?.error) {
        setError(`Failed to add product: ${result.error}`);
      } else {
        console.log("Product added successfully, redirecting...");
        router.push("/product"); // Redirect on success
      }
    } catch (err) {
      console.error("Error calling addProduct server action:", err);
      setError(
        "An unexpected error occurred while adding the product. Please try again."
      );
    }
  }
  // ------------------------------------------------

  // --- Render Component with Dark Gradient Theme ---
  return (
    <div
      className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100" // Themed Gradient BG
    >
      <Navbar /> {/* Navbar at the top */}
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {/* Animation Container for the main content block */}
        <div
          className={`relative z-10 w-full max-w-lg ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* --- Back Link --- */}
          <div className="mb-6">
            <Link
              href="/product" // Link back to the product list page
              className={`inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition duration-300 ease-in-out hover:text-white focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Inventory</span> {/* Updated text */}
            </Link>
          </div>
          {/* Form Content Container (Glass Card Effect) */}
          <div className="space-y-6 border border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-md">
            {/* --- Themed Title --- */}
            <h2
              className={`text-center text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 sm:mb-8`}
            >
              Add New Product
            </h2>
            {/* --- Form --- */}
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {/* --- Name Input --- */}
              {/* Note: Input name="name" should match formData.get("name") in validation */}
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name" // Changed from ProductName to match validation
                  id="name"
                  required
                  maxLength={20}
                  className={getInputClassName(!!formErrors.name)}
                  placeholder="e.g., Heavy Duty Screwdriver"
                />
                {formErrors.name && (
                  <p className={errorTextClasses}>{formErrors.name}</p>
                )}
              </div>

              {/* --- Category Input --- */}
              <div className="relative">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  required
                  maxLength={20}
                  className={getInputClassName(!!formErrors.category)}
                  placeholder="e.g., Tools"
                />
                {formErrors.category && (
                  <p className={errorTextClasses}>{formErrors.category}</p>
                )}
              </div>

              {/* --- Weight Input --- */}
              <div className="relative">
                <label
                  htmlFor="weightperunit"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Weight per Unit (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="weightperunit"
                  id="weightperunit"
                  required
                  min="0" // Allow 0, but validation checks for > 0
                  step="any" // Allows decimals
                  className={getNumberInputClassName(
                    !!formErrors.weightperunit
                  )}
                  placeholder="e.g., 0.5"
                />
                {formErrors.weightperunit && (
                  <p className={errorTextClasses}>{formErrors.weightperunit}</p>
                )}
              </div>

              {/* --- Volume Input --- */}
              <div className="relative">
                <label
                  htmlFor="volumeperunit"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Volume per Unit (m³) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="volumeperunit"
                  id="volumeperunit"
                  required
                  min="0" // Allow 0, but validation checks for > 0
                  step="any" // Allows decimals
                  className={getNumberInputClassName(
                    !!formErrors.volumeperunit
                  )}
                  placeholder="e.g., 0.01"
                />
                {formErrors.volumeperunit && (
                  <p className={errorTextClasses}>{formErrors.volumeperunit}</p>
                )}
              </div>

              {/* --- Quantity Input --- */}
              <div className="relative">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Initial Quantity <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  required
                  min="1"
                  defaultValue="1"
                  className={getNumberInputClassName(!!formErrors.quantity)}
                  placeholder="e.g., 10"
                />
                {formErrors.quantity && (
                  <p className={errorTextClasses}>{formErrors.quantity}</p>
                )}
              </div>

              {/* --- General Error --- */}
              {error && (
                <p className="text-sm text-center text-red-400 pt-2">{error}</p>
              )}

              {/* --- Submit Button --- */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`${buttonPrimaryClasses} w-full disabled:opacity-60 disabled:cursor-not-allowed`}
                  disabled={!userEmail} // Disable button if user isn't loaded/verified yet
                >
                  Add Product
                </button>
                {/* Optionally show loading state text */}
                {!userEmail && !error && isMounted && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Verifying user...
                  </p>
                )}
              </div>
            </form>{" "}
            {/* End Form */}
          </div>{" "}
          {/* End Form Content Container (Glass Card) */}
        </div>{" "}
        {/* End Animation Container */}
      </main>{" "}
      {/* End Main Content Area */}
    </div> // End Root Element
  );
}
