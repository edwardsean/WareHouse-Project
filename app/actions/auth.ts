"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export async function handleSignIn(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // First check if the email exists in the customer table
    const { data: customer, error: customerError } = await supabase
      .from("customer")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (customerError || !customer) {
      return { error: "Invalid credentials" };
    }

    // Sign in with Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        return {
          error:
            "Please check your email to confirm your account before signing in.",
        };
      }
      return { error: authError.message };
    }

    // Set the user type in the metadata explicitly
    await supabase.auth.updateUser({
      data: { type: "customer" },
    });

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function handleSignUp(formData: FormData) {
  const supabase = await createClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const bankAccount = formData.get("bankAccount") as string;

    // First check if the email exists in the employee table
    const { data: existingEmployee, error: employeeCheckError } = await supabase
      .from("employee")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingEmployee) {
      return { error: "Email address is already registered" };
    }

    // Also check if the email exists in the customer table
    const { data: existingCustomer, error: customerCheckError } = await supabase
      .from("customer")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingCustomer) {
      return { error: "Email address is already registered" };
    }

    // Get the highest customer ID and increment by 1
    const { data: maxId } = await supabase
      .from("customer")
      .select("customerid")
      .order("customerid", { ascending: false })
      .limit(1)
      .single();

    const newCustomerId = maxId ? maxId.customerid + 1 : 1;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          type: "customer",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      // Provide a clearer message for duplicate email
      if (authError.message.includes("User already registered")) {
        return { error: "Email address is already registered" };
      }
      return { error: authError.message };
    }

    if (!authData.user?.id) {
      return { error: "Failed to create user" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert customer with new integer ID
    const { error: customerError } = await supabase.from("customer").insert([
      {
        customerid: newCustomerId,
        firstname: firstName,
        lastname: lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        banknumber: bankAccount ? parseInt(bankAccount) : null,
      },
    ]);

    if (customerError) {
      // Rollback auth user creation if customer insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      // Check if this is a duplicate email error and provide a clearer message
      if (
        customerError.message.includes("duplicate key") &&
        customerError.message.includes("customer_email_key")
      ) {
        return { error: "Email address is already registered" };
      }

      return { error: customerError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function handleSignOut() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    // Return success instead of redirecting
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}
