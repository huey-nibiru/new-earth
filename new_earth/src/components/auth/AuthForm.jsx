import React, { useState } from "react";
import supabase from "../../services/supabaseClient";

const AuthForm = () => {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setError("");
    setMessage("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setMessage("Logged in successfully.");
      } else {
        // Validate password match for signup
        if (password !== confirmPassword) {
          setError("Passwords do not match. Please try again.");
          setLoading(false);
          return;
        }

        // Check if email already exists in the database
        const { data: emailExists, error: checkError } = await supabase.rpc(
          "check_email_exists",
          { email_to_check: email }
        );

        if (checkError) {
          // If the function doesn't exist yet, log the error but continue with signup
          // This allows the app to work even if the function hasn't been created
          console.warn(
            "Email check function not available:",
            checkError.message
          );
        } else if (emailExists) {
          // Email already exists in the database
          alert(
            "This email address is already registered. Please log in instead."
          );
          setMode("login");
          setError("");
          setMessage("");
          setLoading(false);
          return;
        }

        // Proceed with signup if email doesn't exist
        // Set display name to email truncated at "@" symbol
        const displayName = email.split("@")[0];
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: displayName,
                display_name: displayName,
              },
            },
          });

        if (signUpError) {
          // Check if the error indicates the user already exists (fallback)
          const errorMessage = signUpError.message.toLowerCase();
          if (
            errorMessage.includes("already registered") ||
            errorMessage.includes("user already exists") ||
            errorMessage.includes("email already") ||
            errorMessage.includes("already been registered")
          ) {
            alert(
              "This email address is already registered. Please log in instead."
            );
            setMode("login");
            setError("");
            setMessage("");
            return;
          }
          throw signUpError;
        }

        setMessage(
          "Sign-up successful. Check your email to verify your account."
        );
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 360, margin: "0 auto" }}>
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
      >
        <button
          onClick={toggleMode}
          style={{
            background: "transparent",
            border: "1px solid gold",
            color: "gold",
            padding: "6px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Have an account? Log in"}
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <h3 style={{ color: "gold", textAlign: "center", margin: 0 }}>
          {mode === "login" ? "Login" : "Sign Up"}
        </h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: 10,
            borderRadius: 6,
            border: "1px solid #444",
            background: "#111",
            color: "#eee",
          }}
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #444",
              background: "#111",
              color: "#eee",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>
        {mode === "signup" && (
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #444",
                background: "#111",
                color: "#eee",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
          }}
        >
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            style={{
              cursor: "pointer",
              width: 16,
              height: 16,
            }}
          />
          <label
            htmlFor="showPassword"
            style={{
              color: "#eee",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            Show password
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            background: loading ? "#333" : "gold",
            color: "#000",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Log In"
            : "Create Account"}
        </button>

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: 14, textAlign: "center" }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ color: "#9be7ff", fontSize: 14, textAlign: "center" }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
