import { useEffect, useState } from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import Homepage from './components/Homepage'


type Page = 'signup' | 'login' | 'homepage'


export default function App() {
const [page, setPage] = useState<Page>('signup')
const [user, setUser] = useState<string | null>(null)


useEffect(() => {
  async function checkAuth() {
    const token = localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");

    if (!token || !username) {
      setPage("login");
      return;
    }

    const isValid = await validateAccessToken(token);

    if (isValid) {
      setUser(username);
      setPage("homepage");
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      setPage("login");
    }
  }

  checkAuth();
}, []);



function handleLogin(username: string, accessToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("username", username);
  setUser(username);
  setPage("homepage");
}

function handleLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("username");

  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  setUser(null);
  setPage("login");
}

  async function refreshAccessToken() {
  try {
    const response = await fetch("http://localhost:5000/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;

  } catch (err) {
    console.log("Refresh failed:", err);
    return null;
  }
}
async function validateAccessToken(token: string) {
  try {
    const response = await fetch("http://localhost:5000/api/auth/validate", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) return true;
    if (response.status === 401 || response.status === 403) {
      const newToken = await refreshAccessToken();
      if (!newToken) return false;
      const retry = await fetch("http://localhost:5000/api/auth/validate", {
        method: "GET",
        headers: { Authorization: `Bearer ${newToken}` },
      });

      return retry.ok;
    }

    return false;

  } catch (err) {
    console.log("Validate error:", err);
    return false;
  }
}



return (
<div className="container">

<div className="card">
{page === 'signup' && (
<>
<Signup onSwitch={() => setPage('login')} />
<p className="muted">Already have an account? <button className="link" onClick={() => setPage('login')}>Login</button></p>
</>
)}


{page === 'login' && (
<>
<Login onSwitch={() => setPage('signup')} onLogin={handleLogin} />
<p className="muted">Don't have an account? <button className="link" onClick={() => setPage('signup')}>Signup</button></p>
</>
)}


{page === 'homepage' && user ? (
  <Homepage username={user} onLogout={handleLogout} />
) : null}

</div>


</div>
)
}