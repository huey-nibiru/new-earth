import React, { useState, useEffect } from "react";
import goldCross from "../../assets/goldcross.png";
import AuthForm from "../../components/auth/AuthForm";
import CentralHub from "../../components/centralHub/CentralHub";
import supabase from "../../services/supabaseClient";
import "./landing.css";

const Landing = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="Landing">
      {user ? (
        <CentralHub />
      ) : (
        <div className="Auth-Container">
          <div className="glowing-circle">
            <img src={goldCross} alt="Gold Cross" className="gold-cross" />
          </div>
          <div className="release-date">
            <h3
              style={{ color: "red", fontFamily: "cursive", fontSize: "33px" }}
            >
              12/25/2025
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
