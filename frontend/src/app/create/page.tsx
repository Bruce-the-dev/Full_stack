"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      setStatus("success");
      setMessage("✅ User created successfully! Redirecting...");
      setEmail("");
      setRole("user");

      // ⏳ Redirect back to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("❌ Failed to create user. Please try again.");
    }
  }

  return (
    <main className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Create New User</h1>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <label className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
              placeholder="Enter email"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-sm font-semibold mb-1">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {status === "loading" ? "Creating..." : "Create User"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${status === "success"
                ? "text-green-600"
                : status === "error"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
          >
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
