import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const res = await api.post("/auth/forgot-password", { email });
      setSuccess(true);
      // In demo mode, backend returns token (in production, it would be sent via email)
      if (res.data?.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to process request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="w-full max-w-md p-8 bg-white border rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password
        </h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Enter your email to receive a password reset link
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="alert alert-error text-sm">{error}</div>}

            <div>
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
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
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="alert alert-success text-sm">
              Password reset instructions have been sent to your email.
            </div>

            {resetToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs font-semibold text-yellow-800 mb-2">
                  Demo Mode - Your reset token:
                </p>
                <code className="text-xs bg-white p-2 rounded block break-all">
                  {resetToken}
                </code>
                <p className="text-xs text-yellow-700 mt-2">
                  Copy this token and use it on the reset password page.
                </p>
              </div>
            )}

            <Link to="/reset-password" className="btn btn-primary w-full">
              Go to Reset Password
            </Link>
          </div>
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

export default ForgotPassword;
