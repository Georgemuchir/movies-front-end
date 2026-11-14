import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Admin from "./pages/Admin.jsx";
import Home from "./pages/Home.jsx";
import Invite from "./pages/Invite.jsx";
import Login from "./pages/Login.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Player from "./pages/Player.jsx";
import Profiles from "./pages/Profiles.jsx";
import Search from "./pages/Search.jsx";

// Signed in, with a profile picked: otherwise go to sign-in or "Who's watching?" first.
function RequireProfile() {
  const { user, profile, checking } = useAuth();
  const location = useLocation();
  if (checking) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (!profile) return <Navigate to="/profiles" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

function RequireUser() {
  const { user, checking } = useAuth();
  if (checking) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { user } = useAuth();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}

function Layout() {
  return (
    <>
      <Navbar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/invite/:token" element={<Invite />} />
      <Route element={<RequireUser />}>
        <Route path="/profiles" element={<Profiles />} />
      </Route>
      <Route element={<RequireProfile />}>
        <Route path="/watch/:id" element={<Player />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/title/:tmdbId" element={<MovieDetail external />} />
          <Route path="/search" element={<Search />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<p className="page-message">Page not found.</p>} />
        </Route>
      </Route>
    </Routes>
  );
}
