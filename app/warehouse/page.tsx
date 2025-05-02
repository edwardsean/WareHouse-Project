"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Warehouse } from "@/types"; // Ensure this matches the type above
import Navbar from "@/app/components/navbar";

// --- SVG Icons (Keep as is) ---
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
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
// -----------------

// Extended warehouse type with zone count
interface WarehouseWithZoneCount extends Warehouse {
  zoneCount?: number;
}

export default function WarehouseList() {
  // --- State Variables ---
  const [allWarehouses, setAllWarehouses] = useState<WarehouseWithZoneCount[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // --- Animation & Input Classes (Keep as is) ---
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";
  const inputBaseClasses =
    "appearance-none block w-full rounded-md px-4 py-2 shadow-sm text-base bg-black/40 text-gray-100 placeholder-gray-500 focus:outline-none transition duration-200";
  const inputBorderNormal =
    "border border-white/20 focus:border-blue-500/50 focus:ring-blue-500/70 focus:ring-1 focus:ring-offset-2 focus:ring-offset-black/80";
  // ------------------------------------

  // --- Fetch Initial Data (Updated to get zone counts) ---
  useEffect(() => {
    setIsMounted(true);
    setLoading(true);
    setError(null);
    setUserType(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadData() {
      try {
        // 1. Get Session and User Type (Keep as is)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session?.user?.email) {
          console.log("No active session or email found.");
        } else {
          const metadataType = session.user.user_metadata?.type;
          if (metadataType === "employee" || metadataType === "customer") {
            setUserType(metadataType);
          } else {
            const { data: employee } = await supabase
              .from("employee")
              .select("email")
              .eq("email", session.user.email)
              .maybeSingle();
            setUserType(employee ? "employee" : "customer");
          }
        }

        // 2. Fetch Warehouses
        const { data: fetchedWarehouses, error: warehousesError } =
          await supabase.from("warehouse").select("*").order("warehouseid");

        if (warehousesError) throw warehousesError;

        // Transform warehouse data to include zone count from status field
        const warehousesWithZoneCounts = (fetchedWarehouses as Warehouse[]).map(
          (warehouse) => {
            // Convert status string to number for zone count
            const zoneCount = parseInt(warehouse.status) || 0;
            return { ...warehouse, zoneCount };
          }
        );

        // Set State with parsed zone counts
        setAllWarehouses(warehousesWithZoneCounts);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(`Failed to load data: ${err.message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); // Empty dependency array - fetch only on mount
  // --- End Fetch Initial Data ---

  // --- Memoized Filtering Logic (Keep as is) ---
  const filteredWarehouses = useMemo(() => {
    if (!searchTerm) {
      return allWarehouses;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allWarehouses.filter(
      (warehouse) =>
        warehouse.warehousename?.toLowerCase().includes(lowerCaseSearchTerm) ||
        warehouse.address?.toLowerCase().includes(lowerCaseSearchTerm) ||
        warehouse.city?.toLowerCase().includes(lowerCaseSearchTerm) ||
        warehouse.warehouseid.toString().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, allWarehouses]);
  // ----------------------------------

  // --- Render Logic ---

  // Loading State (Keep as is)
  if (loading && !isMounted) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-400">Loading Warehouses...</p>
        </main>
      </div>
    );
  }

  // Error State (Keep as is)
  if (error && allWarehouses.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-xl text-red-400 mb-4">Error Loading Data</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            Return Home
          </Link>
        </main>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        {/* Animation Container (Keep as is) */}
        <div
          className={`relative z-10 w-full max-w-7xl ${animationBaseClass} ${
            isMounted ? animationActiveClass : animationInitialClass
          }`}
          style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
        >
          {/* Header: Title, Search, Add Button (Keep as is) */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 md:gap-6">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 order-1 md:order-none">
              Warehouses
            </h1>
            {/* Search Input */}
            <div className="relative w-full md:w-auto order-2 md:order-none md:flex-grow md:max-w-sm ml-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputBaseClasses} ${inputBorderNormal} pl-10 pr-10`}
                placeholder="Search by Name, City, Address, ID..."
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                  aria-label="Clear search"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          {/* End Header */}

          {/* --- Themed Table Area --- */}
          {/* No results message (Keep as is) */}
          {!loading && filteredWarehouses.length === 0 && (
            <div className="text-center text-gray-400 mt-10 py-6 rounded-lg bg-white/5 border border-white/10">
              {searchTerm
                ? `No warehouses found matching "${searchTerm}".`
                : "No warehouses available."}
            </div>
          )}

          {/* Table Rendering (UPDATED Status Column Logic) */}
          {filteredWarehouses.length > 0 && (
            <div className="overflow-x-auto shadow-xl rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
              <table className="min-w-full divide-y divide-white/10">
                {/* Table Head (Keep as is) */}
                <thead className="bg-black/20 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      City
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                {/* Table Body (UPDATED Status Rendering) */}
                <tbody className="divide-y divide-white/10">
                  {filteredWarehouses.map((warehouse) => {
                    // --- START Status Display Logic Update ---
                    const totalCapacity = 40;
                    // Get the zone count from our extended warehouse object
                    const zoneCount = warehouse.zoneCount || 0;

                    // Format the display text
                    const displayStatus = `${zoneCount}/${totalCapacity}`;

                    // Determine CSS classes based on the zone count
                    let statusClasses = "";
                    if (zoneCount < 20) {
                      statusClasses = "bg-green-500/20 text-green-300"; // Green: < 20 zones
                    } else if (zoneCount < 40) {
                      statusClasses = "bg-yellow-500/20 text-yellow-300"; // Yellow: 20-39 zones
                    } else {
                      statusClasses = "bg-red-500/20 text-red-400"; // Red: 40+ zones (full)
                    }
                    // --- END Status Display Logic Update ---

                    return (
                      <tr
                        key={warehouse.warehouseid}
                        className="hover:bg-white/5 transition-colors duration-150"
                      >
                        {/* ID */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">
                          {warehouse.warehouseid}
                        </td>
                        {/* Name */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                          {warehouse.warehousename}
                        </td>
                        {/* STATUS (Using updated display logic for zone count) */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${statusClasses}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                        {/* Address */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                          {warehouse.address}
                        </td>
                        {/* City */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {warehouse.city}
                        </td>
                        {/* Actions (Keep as is) */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-3">
                          <Link
                            href={`/warehouse/${warehouse.warehouseid}/zones`}
                            className="text-blue-400 transition duration-150 ease-in-out hover:text-blue-300 hover:underline"
                          >
                            View Zones
                          </Link>
                          {userType === "employee" && (
                            <Link
                              href={`/warehouse/${warehouse.warehouseid}/zones/add`}
                              className="text-emerald-400 transition duration-150 ease-in-out hover:text-emerald-300 hover:underline"
                            >
                              Add Zone
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* --- End Table Area --- */}

          {/* Add this right after the table but before the end of the animation container */}
          {filteredWarehouses.length > 0 && userType === "employee" && (
            <div className="mt-6 text-center">
              <Link
                href="/warehouse/add"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ease-out hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02] hover:shadow-blue-500/50 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-950 focus:ring-blue-500/70"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add New Warehouse</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
