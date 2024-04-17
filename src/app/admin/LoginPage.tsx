// LoginPage.js
import { useState } from "react";
import { supabase } from "../supabaseClient.js"; // Import Supabase client
import styles from "./login.module.css";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      console.log(supabase);
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      setUser("User"); // Update user state in parent component
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginContainer}>Login</h1>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
