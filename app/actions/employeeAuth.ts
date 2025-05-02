"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export async function handleEmployeeSignIn(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Get employee from database
    const { data: employee, error: fetchError } = await supabase
      .from("employee")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError || !employee) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, employee.password);
    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Create auth session
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { error: authError.message };
    }

    // Set the user type in the metadata explicitly
    await supabase.auth.updateUser({
      data: { type: "employee" },
    });

    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function handleEmployeeSignUp(formData: FormData) {
  const supabase = await createClient();

  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const bankNumber = formData.get("bankNumber") as string;
    const warehouseid = formData.get("warehouseid") as string;

    // First check if the email exists in the customer table
    const { data: existingCustomer, error: customerCheckError } = await supabase
      .from("customer")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingCustomer) {
      return { error: "Email address is already registered" };
    }

    // Also check if the email exists in the employee table
    const { data: existingEmployee, error: employeeCheckError } = await supabase
      .from("employee")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingEmployee) {
      return { error: "Email address is already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique employee ID (you might want to implement a better strategy)
    const { data: maxId } = await supabase
      .from("employee")
      .select("employeeid")
      .order("employeeid", { ascending: false })
      .limit(1)
      .single();

    const newEmployeeId = maxId ? maxId.employeeid + 1 : 1;

    // Create employee record
    const { error: employeeError } = await supabase.from("employee").insert([
      {
        employeeid: newEmployeeId,
        firstname: firstName,
        lastname: lastName,
        email: email.toLowerCase(),
        phonenumber: phoneNumber ? parseInt(phoneNumber) : null,
        password: hashedPassword,
        banknumber: bankNumber ? parseInt(bankNumber) : null,
        joindate: new Date().toISOString(),
        warehouseid: warehouseid,
      },
    ]);

    if (employeeError) {
      // Check if this is a duplicate email error and provide a clearer message
      if (
        employeeError.message.includes("duplicate key") &&
        employeeError.message.includes("employee_email_key")
      ) {
        return { error: "Email address is already registered" };
      }

      return { error: employeeError.message };
    }

    // Create auth user
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          type: "employee", // Add user type to auth metadata
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      // Provide a clearer message for duplicate email
      if (authError.message.includes("User already registered")) {
        return { error: "Email address is already registered" };
      }
      // Rollback employee creation if auth fails
      await supabase.from("employee").delete().eq("employeeid", newEmployeeId);
      return { error: authError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred" };
  }
}
