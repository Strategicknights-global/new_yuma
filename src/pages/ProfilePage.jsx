import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import { User, MapPin, Edit3, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/Navbar";

// ✅ Firebase Auth imports
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const ProfilePage = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Address states
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) {
      navigate("/login?redirect=/profile");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.address) setAddress(data.address);
          if (data.pincode) setPincode(data.pincode);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, [user, isLoggedIn, navigate]);

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported on this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        setAddress(data.display_name || "");
        setPincode(data.address?.postcode || "");
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    });
  };

  const saveAddress = async () => {
    if (!user?.uid) return;
    try {
      setSaving(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { address, pincode });
      setEditMode(false);
      alert("Address updated!");
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Fixed Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        alert("No authenticated user found!");
        return;
      }

      // Re-authenticate with current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message || "Failed to update password");
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
          My Account
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details + Address */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#57ba40] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-[#ffffff]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.displayName || user.email?.split("@")[0] || "User"}
                </h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              {(editMode || !address) ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your pincode"
                    />
                  </div>

                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={fetchLocation}
                      className="flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      <MapPin className="w-4 h-4 mr-2" /> Use Current Location
                    </button>
                    <button
                      onClick={saveAddress}
                      disabled={saving}
                      className="px-4 py-2 bg-[#57ba40] text-white rounded-md hover:bg-[#222222]"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    {editMode && (
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    <strong>Address:</strong> {address}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Pincode:</strong> {pincode}
                  </p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-3 flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        current: !prev.current,
                      }))
                    }
                    className="absolute right-3 top-2 text-gray-600"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        new: !prev.new,
                      }))
                    }
                    className="absolute right-3 top-2 text-gray-600"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Re-enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        confirm: !prev.confirm,
                      }))
                    }
                    className="absolute right-3 top-2 text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#57ba40] text-white rounded-md hover:bg-[#222222]"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;