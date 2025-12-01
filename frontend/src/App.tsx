import { useEffect, useState } from "react";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import api from "./api";

type Page = "signup" | "login" | "homepage";

export default function App() {
  const [page, setPage] = useState<Page>("signup");
  const [user, setUser] = useState<any>(null);

  // ----------------------------
  // CHECK USER ON PAGE LOAD
  // ----------------------------
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await api.get("/me");
        setUser(res.data.user.username);
        setPage("homepage");
      } catch (error) {
        console.log("No valid access token, Axios will refresh automatically.");
      }
    };

    checkUser();
  }, []);

  // ----------------------------
  // ON LOGIN
  // ----------------------------
  function handleLogin(username: string, accessToken: string) {
    localStorage.setItem("accessToken", accessToken);
    setUser(username);
    setPage("homepage");
  }

  // ----------------------------
  // ON LOGOUT
  // ----------------------------
  async function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");

    // use axios, not fetch
    await api.post("/logout").catch(() => {});

    setUser(null);
    setPage("login");
  }

  return (
    <div className="container">
      <div className="card">
        {page === "signup" && (
          <>
            <Signup onSwitch={() => setPage("login")} />
            <p className="muted">
              Already have an account?{" "}
              <button className="link" onClick={() => setPage("login")}>
                Login
              </button>
            </p>
          </>
        )}

        {page === "login" && (
          <>
            <Login onSwitch={() => setPage("signup")} onLogin={handleLogin} />
            <p className="muted">
              Don't have an account?{" "}
              <button className="link" onClick={() => setPage("signup")}>
                Signup
              </button>
            </p>
          </>
        )}

        {page === "homepage" && user ? (
          <Homepage username={user} onLogout={handleLogout} />
        ) : null}
      </div>
    </div>
  );
}
