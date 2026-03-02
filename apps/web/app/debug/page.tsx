"use client";

import { useEffect, useState } from "react";

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Check for common issues
    const checks: string[] = [];
    
    if (typeof window === "undefined") {
      checks.push("❌ window is undefined (SSR issue)");
    } else {
      checks.push("✅ window is available");
    }
    
    if (typeof document === "undefined") {
      checks.push("❌ document is undefined");
    } else {
      checks.push("✅ document is available");
    }
    
    try {
      const test = require("react-native-web");
      checks.push("✅ react-native-web is available");
    } catch (e) {
      checks.push("❌ react-native-web not found");
    }
    
    try {
      const test = require("ui");
      checks.push("✅ ui package is available");
    } catch (e) {
      checks.push("❌ ui package not found");
    }
    
    try {
      const test = require("app");
      checks.push("✅ app package is available");
    } catch (e) {
      checks.push("❌ app package not found");
    }
    
    setErrors(checks);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Debug Page</h1>
      <h2>Environment Checks:</h2>
      <ul>
        {errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
      <h2>Browser Info:</h2>
      <p>User Agent: {typeof window !== "undefined" ? window.navigator.userAgent : "N/A"}</p>
      <p>URL: {typeof window !== "undefined" ? window.location.href : "N/A"}</p>
    </div>
  );
}







