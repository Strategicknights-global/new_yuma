import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import bulk from "../assets/bulk_enquiry1.png";
import Navbar from "../components/Navbar";

const BulkEnquiry = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Captcha state
  const [captchaNums, setCaptchaNums] = useState({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Generate random captcha numbers
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1; // 1–10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1–10
    setCaptchaNums({ num1, num2 });
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Validate phone number live
      if (!/^[6-9]\d{0,9}$/.test(value) && value !== "") {
        setPhoneError("Phone must start with 6, 7, 8, or 9.");
      } else if (value.length > 10) {
        setPhoneError("Phone number must be exactly 10 digits.");
      } else {
        setPhoneError("");
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleCaptchaChange = (e) => {
    setCaptchaAnswer(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone before submitting
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setPhoneError("Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return;
    }

    // Validate captcha
    const correctAnswer = captchaNums.num1 + captchaNums.num2;
    if (parseInt(captchaAnswer) !== correctAnswer) {
      setError("Captcha answer is incorrect. Please try again.");
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);
      setError("");
      setPhoneError("");

      await addDoc(collection(db, "bulkEnquiries"), {
        ...formData,
        createdAt: Timestamp.now(),
      });

      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
      });
      generateCaptcha(); // refresh captcha after successful submit
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
          {/* Left Side - Image */}
          <img
            src={bulk}
            alt="Bulk Enquiry Banner"
            className="w-full md:w-1/2 bg-green-50 flex items-center justify-center 
             rounded-xl shadow-lg object-cover"
          />


          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
              Bulk Enquiry
            </h2>

            {submitted ? (
              <div className="text-green-600 font-semibold text-center text-lg">
                ✅ Thank you! Your enquiry has been submitted.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={`w-full border ${phoneError ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none`}
                    />
                    {phoneError && (
                      <p className="text-red-600 text-sm mt-1">{phoneError}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  ></textarea>
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Solve this to verify:{" "}
                    <span className="font-bold text-green-600">
                      {captchaNums.num1} + {captchaNums.num2} = ?
                    </span>
                  </label>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={handleCaptchaChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg shadow-md hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition disabled:opacity-50 font-semibold text-lg"
                >
                  {loading ? "Submitting..." : "Submit Enquiry"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEnquiry;
