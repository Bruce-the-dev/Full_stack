"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Request failed (${response.status})`);
      }

      setStatus("success");
      setMessage("✅ User created successfully! Redirecting...");
      setEmail("");
      setRole("user");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "❌ Failed to create user.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <div className="mb-4">
          <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-black mb-1">Create New User</h1>
        <p className="text-center text-gray-600 mb-6">
          Add a new user with cryptographic signature verification
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={status === "loading"}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-600 mt-1">
              Hashed with SHA-384 and digitally signed with RSA-PSS
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={status === "loading"}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md disabled:bg-gray-400 transition"
          >
            {status === "loading" ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create User
              </>
            )}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm ${status === "success" ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-black mb-2">Security Features</h3>
          <ul className="space-y-1 text-xs text-gray-700">
            <li>✓ SHA-384 email hashing</li>
            <li>✓ RSA-PSS digital signatures (4096-bit)</li>
            <li>✓ Web Crypto API verification</li>
            <li>✓ Protocol Buffers serialization</li>
          </ul>
        </div>
      </div>
    </main>
  );
}