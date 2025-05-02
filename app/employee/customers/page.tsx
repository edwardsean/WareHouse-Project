"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/app/components/navbar";

// Search and X icons for the search bar
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

// Define Customer interface
interface Customer {
  customerid: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: number | null;
  banknumber?: number | null;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Animation classes
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

  // Input styling classes
  const inputBaseClasses =
    "appearance-none block w-full rounded-md px-4 py-2.5 shadow-sm text-base bg-black/40 text-gray-100 placeholder-gray-500 focus:outline-none transition duration-200";
  const inputBorderNormal =
    "border border-white/20 focus:border-blue-500/50 focus:ring-blue-500/70 focus:ring-1 focus:ring-offset-2 focus:ring-offset-black/80";

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
        // Get session and check if user is an employee
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          router.push("/auth/signin");
          return;
        }

        // Determine user type
        const metadataType = session.user.user_metadata?.type;

        // Use the metadata type as the source of truth
        if (!metadataType || metadataType !== "employee") {
          // If not an employee, sign out and redirect
          await supabase.auth.signOut();
          router.push("/auth/signin");
          return;
        }

        setUserType(metadataType);

        // Fetch all customers with their credentials - excluding password
        const { data: customerData, error: customerError } = await supabase
          .from("customer")
          .select(
            "customerid, firstname, lastname, email, phonenumber, banknumber"
          )
          .order("customerid");

        if (customerError) {
          throw new Error(
            `Failed to fetch customers: ${customerError.message}`
          );
        }

        setCustomers(customerData || []);
      } catch (err: any) {
        console.error("Error loading customers:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Filtered customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.firstname?.toLowerCase().includes(lowerCaseSearchTerm) ||
        customer.lastname?.toLowerCase().includes(lowerCaseSearchTerm) ||
        customer.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        customer.customerid.toString().includes(lowerCaseSearchTerm) ||
        (customer.phonenumber?.toString() || "").includes(
          lowerCaseSearchTerm
        ) ||
        (customer.banknumber?.toString() || "").includes(lowerCaseSearchTerm) ||
        `${customer.firstname} ${customer.lastname}`
          .toLowerCase()
          .includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, customers]);

  // --- Loading/Error States ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Loading customer data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950 text-red-400">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xl mb-4">Error</p>
          <p>{error}</p>
          <Link href="/" className="mt-6 text-blue-400 hover:text-blue-300">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100">
      <Navbar />
      <div className="flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Animated container */}
          <div
            className={`relative z-10 w-full ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }`}
            style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
          >
            {/* Header with title and search bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Customer Management
              </h1>

              {/* Search Input */}
              <div className="relative w-full sm:w-auto sm:flex-grow sm:max-w-sm">
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
                  placeholder="Search by name, email, ID..."
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

            {/* Customer Table */}
            {filteredCustomers.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 py-6 rounded-lg bg-white/5 border border-white/10">
                {searchTerm
                  ? `No customers found matching "${searchTerm}".`
                  : "No customers found."}
              </div>
            ) : (
              <div className="overflow-x-auto shadow-xl rounded-lg border border-white/10 bg-white/5">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-black/20">
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
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                      >
                        Phone Number
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                      >
                        Bank Number
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.customerid}
                        className="hover:bg-white/5 transition-colors duration-150"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                          {customer.customerid}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-200">
                          {customer.firstname} {customer.lastname}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {customer.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {customer.phonenumber || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                          {customer.banknumber || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
