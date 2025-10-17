"use client";

import { useEffect, useState } from "react";
import * as protobuf from "protobufjs";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type ProtoUser = {
  id: string;
  email: string;
  role: string;
  status: boolean;
  createdAt: number;
  signature: Uint8Array;
  publicKeySpki: Uint8Array;
};

export default function Page() {
  const [users, setUsers] = useState<ProtoUser[]>([]);
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        // Load protobuf schema
        const root = await protobuf.load("/proto/users.proto");
        const UsersMessage = root.lookupType("users.Users");

        // Fetch protobuf binary data from backend
        const response = await fetch("http://localhost:3000/users/export");
        if (!response.ok) {
          console.error("Failed to fetch users/export:", response.statusText);
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const message = UsersMessage.decode(buffer);
        const object = UsersMessage.toObject(message, { bytes: Uint8Array });

        const rawUsers = object.users || object.data || [];

        // Filter out any invalid users
        const protoUsers: ProtoUser[] = rawUsers
          .filter((u: any) => u && u.id && u.email && u.signature && u.publicKeySpki)
          .map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            signature: u.signature,
            publicKeySpki: u.publicKeySpki,
          }));

        setUsers(protoUsers);

        // ✅ Fixed helper: properly convert Uint8Array to ArrayBuffer
        function toArrayBuffer(data: Uint8Array | ArrayBuffer | undefined): ArrayBuffer {
          if (!data) {
            throw new Error('Data is undefined');
          }
          if (data instanceof ArrayBuffer) {
            return data;
          }
          // Create a proper ArrayBuffer from Uint8Array
          const buffer = new ArrayBuffer(data.byteLength);
          const view = new Uint8Array(buffer);
          view.set(data);
          return buffer;
        }

        // ✅ Verify signatures in parallel
        const verifyResults: Record<string, boolean> = {};
        await Promise.all(
          protoUsers.map(async (user) => {
            try {
              console.log("=== Verifying user:", user.email, "===");

              // Encode email to bytes (same as backend)
              const encoder = new TextEncoder();
              const emailBytes = encoder.encode(user.email);

              // Also compute hash for logging/comparison
              const hash = await crypto.subtle.digest("SHA-384", emailBytes);

              console.log("Email bytes length:", emailBytes.length);
              console.log("Hash length:", hash.byteLength, "bytes (should be 48)");
              console.log("Hash (hex):", Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''));
              console.log("Public key length:", user.publicKeySpki?.length, "bytes");
              console.log("Signature length:", user.signature?.length, "bytes");

              // Import public key with RSA-PSS
              const pubKey = await crypto.subtle.importKey(
                "spki",
                toArrayBuffer(user.publicKeySpki),
                { name: "RSA-PSS", hash: "SHA-384" },
                true,
                ["verify"]
              );
              console.log("✓ Public key imported successfully");

              // Export public key to see it (for debugging)
              const exportedKey = await crypto.subtle.exportKey("spki", pubKey);
              console.log("Exported key matches:",
                Array.from(new Uint8Array(exportedKey)).join(',') ===
                Array.from(user.publicKeySpki).join(',')
              );

              // ✅ VERIFY AGAINST EMAIL BYTES, NOT HASH!
              const valid = await crypto.subtle.verify(
                { name: "RSA-PSS", saltLength: 48 },
                pubKey,
                toArrayBuffer(user.signature),
                emailBytes  // ✅ Changed from 'hash' to 'emailBytes'
              );

              console.log(`✓ User ${user.email} signature valid:`, valid);
              console.log("==================");
              verifyResults[user.id] = !!valid;
            } catch (err) {
              console.error(`❌ Signature verification error for ${user.email}:`, err);
              console.error("Error details:", err);
              console.log("==================");
              verifyResults[user.id] = false;
            }
          })
        );

        setVerified(verifyResults);

        // Build chart data (users created per day in the last 7 days)
        const buckets: Record<string, number> = {};
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          const key = day.toISOString().slice(0, 10); // YYYY-MM-DD
          buckets[key] = 0;
        }

        protoUsers.forEach((user) => {
          const dateKey = new Date(user.createdAt).toISOString().slice(0, 10);
          if (buckets[dateKey] !== undefined) buckets[dateKey]++;
        });

        const labels = Object.keys(buckets);
        const data = labels.map((label) => buckets[label]);

        setChartData({
          labels,
          datasets: [
            {
              label: "Users Created",
              data,
              backgroundColor: "rgba(59, 130, 246, 0.5)",
              borderColor: "rgb(59, 130, 246)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Error loading users:", err);
      }
    })();
  }, []);

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a
            href="/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Create New User
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Users (Protobuf decoded & signature verified)
        </h1>

        {chartData && (
          <div className="max-w-4xl mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Users Created - Last 7 Days
            </h2>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: true,
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found. Create your first user to get started.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isValid = verified[u.id];
                    return (
                      <tr
                        key={u.id}
                        className={`${isValid
                            ? "bg-white hover:bg-gray-50"
                            : "bg-red-50 text-gray-400"
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {u.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${u.status
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {u.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isValid ? (
                            <span className="text-green-600 text-xl" title="Valid signature">
                              ✅
                            </span>
                          ) : (
                            <span className="text-red-600 text-xl" title="Invalid signature">
                              ❌
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {users.length > 0 && (
          <div className="mt-6 text-sm text-gray-600">
            <p>
              Total users: <strong>{users.length}</strong> |{" "}
              Valid signatures:{" "}
              <strong className="text-green-600">
                {Object.values(verified).filter(Boolean).length}
              </strong>{" "}
              |{" "}
              Invalid signatures:{" "}
              <strong className="text-red-600">
                {Object.values(verified).filter((v) => !v).length}
              </strong>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}