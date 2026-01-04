import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!token || !newPassword || !confirmPassword) {
        throw new Error("All fields are required");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      await api.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);

      // Redirect to signin after 2 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white border rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your reset token and new password
        </p>

        {success ? (
          <div className="space-y-4">
            <div className="alert alert-success text-sm">
              Password reset successful! Redirecting to sign in...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert alert-error text-sm">{error}</div>}

            <div>
              <label className="label">
                <span className="label-text">Reset Token</span>
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your reset token"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div className="text-center mt-4 text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/signin" className="link link-primary font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
