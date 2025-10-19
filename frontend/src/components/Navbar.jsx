import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "bi-house-door" },
    { name: "Upload Report", href: "/upload", icon: "bi-cloud-upload" },
    { name: "Timeline", href: "/timeline", icon: "bi-clock-history" },
    { name: "Chat", href: "/chat", icon: "bi-chat-dots" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container-fluid px-3 px-sm-4">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
          <div className="logo me-2">H</div>
          <span className="fw-bold">HealthMate</span>
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Content */}
        <div
          className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
          id="navbarNav"
        >
          {/* Left Links */}
          {user && (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navigation.map((item) => (
                <li className="nav-item" key={item.name}>
                  <Link
                    to={item.href}
                    className={`nav-link px-3 d-flex align-items-center ${
                      isActive(item.href)
                        ? "active fw-semibold"
                        : ""
                    }`}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Right Side */}
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle d-flex align-items-center py-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.avatar ? (
                    <img
                      className="profile-avatar me-2"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <i className="bi bi-person-circle me-2"></i>
                  )}
                  <span className="d-none d-sm-inline fw-medium">{user.name}</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow">
                  <li>
                    <Link
                      to="/profile"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <i className="bi bi-person me-2"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center text-danger"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                  Login
                </Link>
                <Link to="/register" className="btn btn-light btn-sm px-3">
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;