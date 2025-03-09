import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function JobApplication() {
  const [resume, setResume] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleApply = async () => {
    if (!user) {
      alert("Please log in to apply for jobs");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobTitle, userEmail: user.email }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch AI suggestions");
      }
      const data = await response.json();
      setAiSuggestions(data.suggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      {user ? (
        <>
          <p className="text-sm mb-2">Logged in as {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
      <h2>AI-Powered Job Application</h2>
      <input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
      <textarea placeholder="Paste your resume here..." value={resume} onChange={(e) => setResume(e.target.value)} />
      <button onClick={handleApply}>Apply with AI Assistance</button>
      {aiSuggestions && <p>AI Suggestions: {aiSuggestions}</p>}
    </div>
  );
}
