import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) setErrors({ general: error });
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await login(formData.email, formData.password);
    if (result.success) navigate("/dashboard");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="card border-0 shadow-lg rounded-4 fade-in">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="logo mx-auto mb-3 shadow-sm"></div>
                  <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
                  <p className="text-muted mb-0">
                    Sign in to your{" "}
                    <span className="text-primary fw-semibold">HealthMate</span>{" "}
                    account
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-envelope text-primary"></i>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control rounded-end ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock text-primary"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control ${
                          errors.password ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {errors.general && (
                    <div
                      className="alert alert-danger d-flex align-items-center mt-3"
                      role="alert"
                    >
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <div>{errors.general}</div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="d-grid mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>

                  {/* Register Redirect */}
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Don’t have an account?{" "}
                      <Link
                        to="/register"
                        className="text-primary fw-semibold text-decoration-none"
                      >
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;