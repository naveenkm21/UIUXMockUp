"use client";

import { useState } from "react";

export default function TestMultimodal() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testMultimodal = async () => {
    setLoading(true);
    setResponse("");
    
    try {
      const result = await fetch("/api/multimodal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await result.json();
      setResponse(data.response || data.error || "No response received");
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">OpenRouter Multimodal Test</h1>
      
      <button
        onClick={testMultimodal}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Testing..." : "Test Multimodal API"}
      </button>

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="whitespace-pre-wrap text-sm">{response}</pre>
        </div>
      )}
    </div>
  );
}
