import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPasswordError("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      return setPasswordError("New passwords do not match");
    }

    if (newPassword.length < 6) {
      return setPasswordError("New password must be at least 6 characters");
    }

    setChangingPassword(true);
    try {
      await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          err.message ||
          "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="alert alert-error max-w-md">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <button onClick={() => navigate("/")} className="btn btn-ghost btn-sm">
          Back to Notes
        </button>
      </div>

      {/* Profile Info */}
      <div className="card bg-base-100 shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Profile Information</h2>

        <div>
          <label className="label">
            <span className="label-text font-medium">Name</span>
          </label>
          <input
            type="text"
            value={profile?.name || ""}
            className="input input-bordered w-full"
            disabled
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Email</span>
          </label>
          <input
            type="email"
            value={profile?.email || ""}
            className="input input-bordered w-full"
            disabled
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Password</span>
          </label>
          <input
            type="password"
            value="••••••••"
            className="input input-bordered w-full"
            disabled
          />
        </div>
      </div>

      {/* Change Password */}
      <div className="card bg-base-100 shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="alert alert-error text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="alert alert-success text-sm">{passwordSuccess}</div>
          )}

          <div>
            <label className="label">
              <span className="label-text">Current Password</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
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
              <span className="label-text">Confirm New Password</span>
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

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={changingPassword}
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
