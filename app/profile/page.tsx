"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/app/components/navbar";

// Interface for customer data
interface CustomerProfile {
  customerid: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber?: number | null;
  banknumber?: number | null;
}

export default function CustomerProfile() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
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

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function loadProfile() {
      try {
        // Get session
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
        if (
          !metadataType ||
          (metadataType !== "employee" && metadataType !== "customer")
        ) {
          // If metadata type is missing or invalid, sign out and redirect
          await supabase.auth.signOut();
          router.push("/auth/signin");
          return;
        }

        setUserType(metadataType);

        // Fetch customer profile if user is a customer
        if (metadataType === "customer") {
          const { data: customerData, error: customerError } = await supabase
            .from("customer")
            .select(
              "customerid, firstname, lastname, email, phonenumber, banknumber"
            )
            .eq("email", session.user.email)
            .single();

          if (customerError) {
            throw new Error(
              `Failed to fetch profile: ${customerError.message}`
            );
          }

          setProfile(customerData);
        } else {
          // If employee, fetch the employee data
          const { data: employeeData, error: employeeError } = await supabase
            .from("employee")
            .select("employeeid, firstname, lastname, email")
            .eq("email", session.user.email)
            .single();

          if (employeeError) {
            throw new Error(
              `Failed to fetch profile: ${employeeError.message}`
            );
          }

          setProfile({
            customerid: employeeData.employeeid,
            firstname: employeeData.firstname,
            lastname: employeeData.lastname,
            email: employeeData.email,
            phonenumber: null,
            banknumber: null,
          });
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Loading profile data...
      </div>
    );
  }

  // Error state
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
        <div className="max-w-3xl mx-auto">
          {/* Animated container */}
          <div
            className={`relative z-10 w-full ${animationBaseClass} ${
              isMounted ? animationActiveClass : animationInitialClass
            }`}
            style={{ transitionDelay: isMounted ? "100ms" : "0ms" }}
          >
            {/* Header with title */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                {userType === "employee"
                  ? "Employee Profile"
                  : "Customer Profile"}
              </h1>
            </div>

            {/* Profile Card */}
            {profile && (
              <div className="overflow-hidden shadow-xl rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="px-6 py-8">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-24 w-24 rounded-full flex items-center justify-center text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white mb-4">
                      {profile.firstname.charAt(0)}
                      {profile.lastname.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {profile.firstname} {profile.lastname}
                    </h2>
                    <p className="text-gray-400 mt-1">{profile.email}</p>
                    <div
                      className={`mt-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        userType === "employee"
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                          : "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {userType}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">ID</p>
                      <p className="font-medium text-white">
                        {profile.customerid}
                      </p>
                    </div>

                    {userType === "customer" && (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Phone Number</p>
                          <p className="font-medium text-white">
                            {profile.phonenumber || "—"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Bank Number</p>
                          <p className="font-medium text-white">
                            {profile.banknumber || "—"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
