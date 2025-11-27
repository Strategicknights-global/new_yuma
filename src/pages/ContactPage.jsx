import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const ContactPage = () => {
  const { user, isLoggedIn } = useAuth(); // ✅ updated
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [siteConfig, setSiteConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }

    // Fetch footer info for social links
    const fetchConfig = async () => {
      try {
        const configDoc = await getDoc(
          doc(db, "siteConfiguration", "mainConfig")
        );
        if (configDoc.exists()) setSiteConfig(configDoc.data());
      } catch (err) {
        console.error("Error fetching site configuration:", err);
      }
    };
    fetchConfig();
  }, [user, isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setNotification("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setNotification("");
    try {
      await addDoc(collection(db, "contactSubmissions"), {
        ...formData,
        submittedAt: Timestamp.now(),
        userId: user ? user.uid : "guest",
      });
      setNotification("Thank you! Your message has been sent.");
      setFormData({ name: "", email: "", message: "" }); // Clear form
    } catch (error) {
      console.error("Error submitting form: ", error);
      setNotification("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <Navbar />

      {notification && (
        <div
          className={`fixed top-20 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg ${
            notification.toLowerCase().includes("error")
              ? "bg-red-500"
              : "bg-green-500"
          } text-white`}
        >
          {notification}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative">
        <img
          src="/food_banner.png"
          alt="Healthy food background"
          className="w-full h-[350px] object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            Get In Touch
          </h1>
          <p className="text-lg text-white mt-2 drop-shadow">
            We&apos;d love to hear from you!
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-orange-100 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-orange-900 mb-6">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-orange-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-orange-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-orange-700"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-md font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-orange-100 p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-orange-900 mb-4">
                Contact Information
              </h3>
              <p className="text-orange-700">
                <strong>Address:</strong>{" "}
                {siteConfig?.footerInfo?.address ||
                  "123 Street Address, Old Nagar, Sample City – 123456"}
              </p>
              <p className="text-orange-700 mt-2">
                <strong>Email:</strong>{" "}
                {siteConfig?.footerInfo?.email || "info@yumas.com"}
              </p>
              <p className="text-orange-700 mt-2">
                <strong>Phone:</strong>{" "}
                {siteConfig?.footerInfo?.phone || "+91 98765 43210"}
              </p>
            </div>
            <div className="bg-orange-100 p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-orange-900 mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a
                  href={siteConfig?.footerInfo?.socials?.instagram || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-pink-600"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href={siteConfig?.footerInfo?.socials?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-blue-600"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href={siteConfig?.footerInfo?.socials?.youtube || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-red-600"
                >
                  <Youtube size={24} />
                </a>
                <a
                  href={siteConfig?.footerInfo?.socials?.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-700 hover:text-blue-500"
                >
                  <Twitter size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContactPage;