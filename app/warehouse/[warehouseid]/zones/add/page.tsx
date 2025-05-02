"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { addWarehouseZone } from "@/app/actions/warehouse"; // Action Import
import Navbar from "@/app/components/navbar"; // Navbar Import

// Interface for form validation errors
interface FormErrors {
  zoneid?: string;
  inventoryid?: string;
  quantity?: string;
}

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

export default function AddWarehouseZone() {
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [warehouseName, setWarehouseName] = useState<string>("");
  const [userType, setUserType] = useState<string | null>(null); // Keep track of user type for auth check
  const [isLoading, setIsLoading] = useState<boolean>(true); // Add loading state
  const router = useRouter();
  const params = useParams();
  // Ensure warehouseId is parsed correctly and handle potential NaN
  const warehouseIdParam = params.warehouseid as string;
  const warehouseId = warehouseIdParam ? parseInt(warehouseIdParam) : NaN;

  const [isMounted, setIsMounted] = useState(false); // For animation

  // --- Reusable Class Strings for Tailwind ---
  const inputBaseClasses =
    "appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm text-base bg-black/40 text-gray-100 placeholder-gray-500 focus:outline-none transition duration-200";
  const inputBorderNormal =
    "border border-white/20 focus:border-blue-500/50 focus:ring-blue-500/70 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const inputBorderError =
    "border border-red-500/60 focus:border-red-500/60 focus:ring-red-500/50 focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80";
  const inputNumberNoSpinClasses =
    "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&]:[-moz-appearance:textfield]";
  const errorTextClasses = "mt-1.5 text-xs text-red-400 text-left";
  const buttonPrimaryBaseClasses =
    "group relative flex w-full items-center justify-center gap-x-3 rounded-lg px-6 py-3 text-base font-semibold text-white shadow-xl transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80";
  const buttonPrimaryGradient =
    "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 focus:ring-blue-500/70";
  const buttonPrimaryClasses = `${buttonPrimaryBaseClasses} ${buttonPrimaryGradient}`;
  // Helper Functions for Classes
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
  // ------------------------------------------

  // --- Animation classes ---
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";
  // --------------------------

  useEffect(() => {
    setIsMounted(true); // For animation

    if (isNaN(warehouseId)) {
      console.error("Invalid warehouse ID from route.");
      setError("Invalid warehouse information.");
      setIsLoading(false);
      // Optionally redirect or show a permanent error
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadData() {
      setIsLoading(true); // Start loading
      try {
        // Check user session and type
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUserType = session?.user?.user_metadata?.type;
        setUserType(currentUserType ?? null);

        // **Authorization Check**
        if (currentUserType !== "employee") {
          setError("Access Denied: Only employees can add zones.");
          // Consider redirecting away from the add page if not employee
          // router.push('/unauthorized');
          setIsLoading(false);
          return; // Stop further loading if not authorized
        }

        // Fetch warehouse name
        const { data: warehouse, error: fetchErr } = await supabase
          .from("warehouse")
          .select("warehousename")
          .eq("warehouseid", warehouseId)
          .single();

        if (fetchErr) {
          console.error("Error fetching warehouse name:", fetchErr);
          setError("Failed to load warehouse details.");
        } else if (warehouse) {
          setWarehouseName(warehouse.warehousename);
        } else {
          setError("Warehouse not found.");
        }
      } catch (err) {
        console.error("Error in useEffect loading:", err);
        setError("An unexpected error occurred while loading page data.");
      } finally {
        setIsLoading(false); // Finish loading
      }
    }

    loadData();
  }, [warehouseId, router]); // Include router in dependencies if used for redirection inside

  // --- Form Validation ---
  async function validateForm(formData: FormData): Promise<boolean> {
    const errors: FormErrors = {};
    const zoneid = formData.get("zoneid") as string;
    const inventoryid = formData.get("inventoryid") as string;
    const quantity = formData.get("quantity") as string;

    if (!zoneid || zoneid.trim().length === 0)
      errors.zoneid = "Zone ID is required.";
    else if (zoneid.length > 20)
      errors.zoneid = "Zone ID must be 20 characters or less.";

    // Inventory ID is optional but must be a positive number if provided
    if (inventoryid && inventoryid.trim() !== "") {
      const inventoryidNum = parseInt(inventoryid);
      if (isNaN(inventoryidNum) || inventoryidNum <= 0)
        errors.inventoryid = "Inventory ID must be a positive number.";
    }

    // Quantity validation
    const quantityNum = parseInt(quantity);
    if (quantity && (isNaN(quantityNum) || quantityNum < 0))
      errors.quantity = "Quantity must be a non-negative number.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // --- Form Submission ---
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFormErrors({});

    // Double-check authorization before submitting
    if (userType !== "employee") {
      setError("Access Denied: Only employees can add warehouse zones.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const isValid = await validateForm(formData);
    if (!isValid) {
      setError("Please correct the errors noted below.");
      return;
    }

    // Append warehouse ID needed by the server action
    formData.append("warehouseid", warehouseId.toString());

    try {
      // Call the Server Action
      const result = await addWarehouseZone(formData);
      if (result?.error) {
        setError(`Failed to add zone: ${result.error}`);
      } else {
        // Redirect back to the zones list for that warehouse
        router.push(`/warehouse/${warehouseId}/zones`);
      }
    } catch (err) {
      console.error("Failed to call addWarehouseZone action:", err);
      setError(
        "An unexpected client-side error occurred while adding the zone."
      );
    }
  }

  // Conditional Rendering for Loading/Error states
  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-400">Loading...</p>
        </main>
      </div>
    );
  }

  // Show error overlay if access denied or initial load failed badly
  if (
    (!userType && isMounted) ||
    (userType && userType !== "employee") ||
    error?.includes("Access Denied") ||
    error?.includes("Invalid warehouse")
  ) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">
            Access Denied or Error
          </h2>
          <p className="text-gray-300 mb-6">
            {error ||
              "You do not have permission to view this page or the required data could not be loaded."}
          </p>
          <Link
            href="/warehouse"
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            Return to Warehouses
          </Link>
        </main>
      </div>
    );
  }

  // --- Render Actual Form ---
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {/* Animation Container */}
        <div
          className={`relative z-10 w-full max-w-lg ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* Back Link */}
          <div className="mb-6">
            <Link
              href={`/warehouse/${warehouseId}/zones`}
              className={`inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition duration-300 ease-in-out hover:text-white focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>
                Back to Zones for {warehouseName || `Warehouse ${warehouseId}`}
              </span>
            </Link>
          </div>
          {/* Form Card */}
          <div className="space-y-6 border border-white/10 rounded-xl shadow-2xl p-6 sm:p-8 bg-white/5 backdrop-blur-md">
            {/* Title */}
            <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 sm:mb-8">
              Add New Zone {warehouseName && `to ${warehouseName}`}
            </h2>
            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {/* Zone ID Field */}
              <div className="relative">
                <label
                  htmlFor="zoneid"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Zone ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="zoneid"
                  id="zoneid"
                  required
                  maxLength={20}
                  className={getInputClassName(!!formErrors.zoneid)}
                  placeholder="e.g., A, B, R1, C-03"
                />
                {formErrors.zoneid && (
                  <p className={errorTextClasses}>{formErrors.zoneid}</p>
                )}
              </div>

              {/* Inventory ID Field */}
              <div className="relative">
                <label
                  htmlFor="inventoryid"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Inventory ID (Optional)
                </label>
                <input
                  type="number"
                  name="inventoryid"
                  id="inventoryid"
                  min="1"
                  step="1"
                  className={getNumberInputClassName(!!formErrors.inventoryid)}
                  placeholder="e.g., 101, 204, 305"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Link this zone to a specific inventory item
                </p>
                {formErrors.inventoryid && (
                  <p className={errorTextClasses}>{formErrors.inventoryid}</p>
                )}
              </div>

              {/* Quantity Field */}
              <div className="relative">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-300 mb-1.5 text-left"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  step="1"
                  defaultValue="0"
                  className={getNumberInputClassName(!!formErrors.quantity)}
                  placeholder="e.g., 10, 25, 100"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Number of inventory items in this zone
                </p>
                {formErrors.quantity && (
                  <p className={errorTextClasses}>{formErrors.quantity}</p>
                )}
              </div>

              {/* General Error Display */}
              {error && !error.includes("Access Denied") && (
                <p className="text-sm text-center text-red-400 pt-2">{error}</p>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={userType !== "employee"}
                  className={`${buttonPrimaryClasses} w-full disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Add Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
