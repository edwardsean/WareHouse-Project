"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { handleSignOut } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

// --- SVG Icons (Keep as before) ---
// Basic User Icon
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

// Sign Out Icon
const SignOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);
// ------------------------------------

export default function Navbar() {
  const [session, setSession] = useState<any>(undefined);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  // --- Keep useEffect for session handling as is ---
  useEffect(() => {
    setIsLoading(true);
    setError(null); // Clear error on re-check
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const updateUserState = async (currentSession: any | null) => {
      setSession(currentSession); // Update session regardless
      if (currentSession?.user?.email) {
        const metadataType = currentSession.user.user_metadata?.type;
        if (metadataType === "employee" || metadataType === "customer") {
          setUserType(metadataType);
          // console.log(`Navbar: User type from metadata: ${metadataType}`);
        } else {
          // console.log("Navbar: Metadata type missing or invalid, attempting fallback DB check.");
          // Fallback check only if metadata fails
          try {
            const { count, error: checkError } = await supabase
              .from("employee")
              .select("email", { count: "exact", head: true })
              .eq("email", currentSession.user.email);

            if (checkError) {
              console.error(
                "Navbar: Error during fallback DB check:",
                checkError
              );
              setUserType("customer"); // Default to customer on error? Or null?
            } else {
              const type = count && count > 0 ? "employee" : "customer";
              setUserType(type);
              // console.log(`Navbar: User type from fallback DB: ${type}`);
              // Optionally update metadata here if needed, but be careful
              // await supabase.auth.updateUser({ data: { type: type } });
            }
          } catch (fallbackError) {
            console.error(
              "Navbar: Exception during fallback DB check:",
              fallbackError
            );
            setUserType("customer"); // Safer default
          }
        }
      } else {
        // console.log("Navbar: No user session or email.");
        setUserType(null);
      }
    };

    // Initial load
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        await updateUserState(session);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Navbar: Error getting initial session:", err);
        setError("Failed to load user session.");
        setIsLoading(false);
      });

    // Listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // console.log(`Navbar: Auth state changed, Event: ${_event}`);
      await updateUserState(session);
      // Potentially refresh parts of page state if needed based on event type
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount + cleanup

  // --- Sign Out Logic ---
  async function onSignOut() {
    setError(null);
    const result = await handleSignOut();
    if (result?.error) {
      console.error("Sign out error:", result.error);
      setError("Sign out failed.");
    } else if (result?.success) {
      setSession(null);
      setUserType(null);
      router.push("/auth/signin"); // Redirect after sign out
      router.refresh(); // Ensure layout state is cleared/refreshed
    }
  }
  // --------------------

  // Loading state placeholder
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 h-[60px] bg-gradient-to-b from-gray-950 to-black border-b border-white/10 animate-pulse"></header>
    );
  }

  // --- Render Navbar ---
  return (
    <header className="sticky top-0 z-40 px-4 py-3 bg-gradient-to-b from-gray-950 to-black shadow-lg border-b border-white/10 font-sans">
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500 rounded-sm"
        >
          <Image src="/logo.png" alt="logo" width={144} height={30} priority />
        </Link>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-3 md:gap-4 text-gray-300">
          {session ? (
            <>
              {/* User Type Badge */}
              {userType && (
                <span
                  title={`Signed in as ${userType}`}
                  className={`hidden md:inline-block px-1.5 text-xs font-medium uppercase tracking-wider rounded-full ${
                    userType === "employee"
                      ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40" // Slightly enhanced employee badge
                      : "bg-blue-600/30 text-blue-300 border border-blue-500/40" // Slightly enhanced customer badge
                  }`}
                >
                  {userType}
                </span>
              )}

              {/* Standard Nav Links */}
              <Link
                href="/product"
                className={`hidden sm:inline rounded px-2 py-1 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black/80 focus:ring-blue-500 ${
                  pathname.startsWith("/product")
                    ? "font-semibold text-blue-400"
                    : "font-medium text-gray-400 hover:text-gray-100"
                }`}
              >
                Product
              </Link>
              <Link
                href="/warehouse"
                className={`hidden sm:inline rounded px-2 py-1 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black/80 focus:ring-blue-500 ${
                  pathname.startsWith("/warehouse")
                    ? "font-semibold text-blue-400"
                    : "font-medium text-gray-400 hover:text-gray-100"
                }`}
              >
                Warehouse
              </Link>

              {/* --- Employee Only: Customers Link --- */}
              {userType === "employee" && (
                <Link
                  href="/employee/customers" // <<<<< New Link
                  className={`hidden sm:inline rounded px-2 py-1 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-black/80 focus:ring-blue-500 ${
                    pathname.startsWith("/employee/customers") // <<<<< Condition for active state
                      ? "font-semibold text-blue-400" // Changed from emerald to blue to match other buttons
                      : "font-medium text-gray-400 hover:text-gray-100"
                  }`}
                >
                  Customers
                </Link>
              )}
              {/* ----------------------------------- */}

              {/* User Email/Link - Show icon on smaller screens */}
              <Link
                href="/profile"
                title={session.user.email}
                className="group flex items-center gap-1.5 text-sm transition duration-150 font-medium text-gray-300 hover:text-white focus:outline-none focus:text-white"
              >
                <UserCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
                <span className="hidden lg:inline">{session.user.email}</span>{" "}
                {/* Show email only on large screens */}
              </Link>

              {/* Sign Out Button */}
              <form action={onSignOut} className="contents">
                {" "}
                {/* Use 'contents' to avoid affecting layout */}
                <button
                  type="submit"
                  className={`group relative flex items-center justify-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white shadow-md bg-gradient-to-r from-red-600/90 to-orange-700/90 transition-all duration-300 ease-out hover:from-red-500 hover:to-orange-600 hover:scale-[1.05] hover:shadow-red-500/40 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-red-500/60`}
                  title="Sign Out"
                >
                  <SignOutIcon className="w-4 h-4 group-hover:scale-105 transition-transform" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              </form>

              {/* Display Sign Out Error */}
              {error && session && (
                <span
                  className="hidden md:inline text-red-400 text-xs pl-2"
                  title={error}
                >
                  {/* Simple indicator, full error on title */} ❗ Error
                </span>
              )}
            </>
          ) : (
            // --- Signed Out State: Sign In Button ---
            <Link
              href="/auth/signin"
              className={`group relative inline-flex items-center justify-center gap-x-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-300 ease-out hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.05] hover:shadow-blue-500/40 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-black/80 focus:ring-blue-500/70`}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
      {/* Sign out Error display on small screens (only if logged in) */}
      {error && session && (
        <div className="md:hidden text-red-400 text-xs text-center pt-1">
          {error}
        </div>
      )}
    </header>
  );
}
