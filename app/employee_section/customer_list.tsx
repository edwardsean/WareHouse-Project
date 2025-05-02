"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/app/components/navbar";

// Define Customer interface
interface Customer {
  customerid: number;
  firstname: string;
  lastname: string;
  email: string;
  banknumber?: number | null;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Animation classes
  const animationBaseClass = "opacity-0 transition-all duration-700 ease-out";
  const animationActiveClass = "opacity-100 translate-y-0";
  const animationInitialClass = "translate-y-5";

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
          .select("customerid, firstname, lastname, email, banknumber") // Specify fields to exclude password
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
            {/* Header with title */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Customer Management
              </h1>
            </div>

            {/* Customer Table */}
            {customers.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                No customers found.
              </p>
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
                        Bank Account
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {customers.map((customer) => (
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
