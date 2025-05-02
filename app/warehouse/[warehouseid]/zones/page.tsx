"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { WarehouseZone } from "@/types"; // Assuming you have this type defined
import Navbar from "@/app/components/navbar"; // Assuming correct path
import { useParams } from "next/navigation";

// --- SVG Icons ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

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
// -----------------

export default function WarehouseZones() {
  const [zones, setZones] = useState<WarehouseZone[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [warehouseName, setWarehouseName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const warehouseId = params.warehouseid
    ? parseInt(params.warehouseid as string)
    : null; // Handle potential null/undefined

  // --- Animation Setup ---
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true); // Trigger animation on client mount
  }, []);

  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";
  // -------------------------

  useEffect(() => {
    // Ensure warehouseId is valid before proceeding
    if (warehouseId === null || isNaN(warehouseId)) {
      setError("Invalid Warehouse ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setUserType(null); // Reset user type on load

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadData() {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError)
          throw new Error(`Session Error: ${sessionError.message}`);
        if (!session?.user?.email) {
          console.log("No active session or email found.");
          // Decide how to handle - redirect? show error? For now, just stop loading.
          setLoading(false);
          return;
        }

        // Determine user type (using metadata primarily) - Reuse logic from ProductList
        const metadataType = session.user.user_metadata?.type;
        let determinedUserType: string | null = null;
        if (metadataType === "employee" || metadataType === "customer") {
          determinedUserType = metadataType;
        } else {
          const { count, error: employeeCheckError } = await supabase
            .from("employee")
            .select("email", { count: "exact", head: true })
            .eq("email", session.user.email);
          if (employeeCheckError)
            console.error(
              "Employee Check Error (non-blocking):",
              employeeCheckError.message
            );
          determinedUserType = count && count > 0 ? "employee" : "customer";
        }
        setUserType(determinedUserType);

        // Get warehouse name using .maybeSingle() for better error handling
        const { data: warehouse, error: warehouseError } = await supabase
          .from("warehouse")
          .select("warehousename")
          .eq("warehouseid", warehouseId)
          .maybeSingle(); // Use maybeSingle

        if (warehouseError) {
          // This error might be "multiple rows returned" if ID isn't unique
          throw new Error(
            `Failed to fetch warehouse details: ${warehouseError.message}`
          );
        }
        if (!warehouse) {
          // Warehouse ID not found
          throw new Error(`Warehouse with ID ${warehouseId} not found.`);
        }
        setWarehouseName(warehouse.warehousename);

        // Get warehouse zones
        const { data: fetchedZones, error: zonesError } = await supabase
          .from("warehousezone")
          .select("*")
          .eq("warehouseid", warehouseId)
          .order("zoneid"); // Remove .order("subzoneid")

        if (zonesError) {
          throw new Error(`Failed to load zones: ${zonesError.message}`);
        }
        setZones(fetchedZones || []);
      } catch (err: any) {
        console.error("Error loading zone data:", err);
        setError(err.message || "An unexpected error occurred.");
        setZones([]); // Clear zones on error
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [warehouseId]); // Re-run if warehouseId changes

  // --- Loading/Error States (Themed) ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Loading zone data...
      </div>
    );
  }

  if (error) {
    // Show error regardless of zones length now
    return (
      <div className="min-h-screen flex flex-col bg-gray-950 text-red-400">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
          <Link
            href="/warehouse"
            className="mt-6 text-blue-400 hover:text-blue-300"
          >
            ← Back to Warehouses
          </Link>
        </div>
      </div>
    );
  }
  // ---------------------------------

  return (
    // --- Themed Root Container ---
    <div className="relative min-h-screen flex flex-col bg-gray-950 text-gray-100 overflow-y-auto">
      <Navbar />
      {/* --- Max Width Content Container --- */}
      <div className="flex-grow flex flex-col items-center w-full px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        {/* Animation Container */}
        <div
          className={`relative z-10 w-full max-w-7xl ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* --- Themed Header --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            {/* Left side: Back link and Title */}
            <div className="flex-grow">
              <Link
                href="/warehouse"
                className="
                      inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2
                      transition duration-300 ease-in-out
                      hover:text-white hover:scale-[1.02]
                      focus:outline-none focus:ring-1 focus:ring-gray-400/50 rounded p-1 -ml-1 ${/* Negative margin to align focus ring */}
                    "
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Warehouses</span>
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                <span className="text-gray-400 font-normal text-2xl sm:text-3xl block sm:inline mb-1 sm:mb-0 sm:mr-2">
                  Zone:
                </span>{" "}
                {warehouseName}
              </h1>
            </div>

            {/* Right side: Add Zone Button */}
            {userType === "employee" && (
              <Link
                href={`/warehouse/${warehouseId}/zones/add`}
                className={`mt-2 sm:mt-0 flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2 text-base font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ease-out hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.03] hover:shadow-blue-500/50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500/70`}
              >
                <PlusIcon className="w-5 h-5" />
                Add New Zone
              </Link>
            )}
          </div>

          {/* --- Themed Table Area --- */}
          {zones.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              No zones found in this warehouse.
            </p>
          ) : (
            <div className="overflow-x-auto shadow-xl rounded-lg border border-white/10 bg-white/5">
              <table className="min-w-full divide-y divide-white/10">
                {/* Themed Table Head */}
                <thead className="bg-black/20">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Zone ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Space Occupied
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Availability
                    </th>
                  </tr>
                </thead>
                {/* Themed Table Body */}
                <tbody className="divide-y divide-white/10">
                  {zones.map((zone) => (
                    <tr
                      key={`${zone.warehouseid}-${zone.zoneid}`}
                      className="hover:bg-white/5 transition-colors duration-150"
                    >
                      {/* Themed Table Cells */}
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">
                        {zone.zoneid}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {zone.spaceoccupied ?? 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {/* Themed Availability Badge */}
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${
                            zone.spaceavailability
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {zone.spaceavailability ? "Available" : "Full"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* --- End Table Area --- */}
        </div>{" "}
        {/* End Animation Container */}
      </div>{" "}
      {/* End Max Width Container */}
    </div> // End Root Element
  );
}
