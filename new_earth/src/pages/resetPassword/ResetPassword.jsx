import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../services/supabaseClient";

const inputStyle = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #444",
  background: "#111",
  color: "#eee",
  width: "100%",
  boxSizing: "border-box",
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const detectSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setSessionReady(true);
        setCheckedSession(true);
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;
      const {
        data: { session: retrySession },
      } = await supabase.auth.getSession();
      if (retrySession) setSessionReady(true);
      setCheckedSession(true);
    };

    detectSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSessionReady(true);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setMessage("Password updated. Redirecting…");
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  if (checkedSession && !sessionReady) {
    return (
      <div style={{ maxWidth: 360, margin: "48px auto", padding: 16 }}>
        <h3 style={{ color: "gold", textAlign: "center" }}>
          Reset link invalid or expired
        </h3>
        <p style={{ color: "#ccc", textAlign: "center", fontSize: 14 }}>
          Request a new link from the login page using &quot;Forgot
          password?&quot;
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ width: "100%", maxWidth: 360, margin: "48px auto", padding: 16 }}
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <h3 style={{ color: "gold", textAlign: "center", margin: 0 }}>
          Choose a new password
        </h3>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
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
            id="resetShowPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
            style={{ cursor: "pointer", width: 16, height: 16 }}
          />
          <label
            htmlFor="resetShowPassword"
            style={{ color: "#eee", cursor: "pointer", userSelect: "none" }}
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
          {loading ? "Please wait…" : "Save password"}
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

export default ResetPassword;
