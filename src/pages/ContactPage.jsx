import React, { useState, useEffect } from "react";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
} from "lucide-react";

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
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
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
        <div className="absolute inset-0"></div>
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
          <div className="bg-[#ffffff] p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#000000] mb-6">
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#000000]"
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
                  className="mt-1 block w-full px-3 py-2 border border-[#000000] rounded-md shadow-sm focus:ring-[#57ba40] focus:border-[#57ba40]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#000000]"
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
                  className="mt-1 block w-full px-3 py-2 border border-border-[#000000] rounded-md shadow-sm focus:ring-[#57ba40] focus:border-[#57ba40]"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[#000000]"
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
                  className="mt-1 block w-full px-3 py-2 border border-[#000000] rounded-md shadow-sm focus:ring-[#57ba40] focus:border-[#57ba40]resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#57ba40] text-white py-3 rounded-md font-semibold hover:bg-[#222222] transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-[#ffffff] p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#000000] mb-4">
                Contact Information
              </h3>
              <p className="text-[#000000]">
                <strong>Address:</strong>{" "}
                {siteConfig?.footerInfo?.address ||
                  " 29th Cross Rd, Kondappa Layout, C.V. Raman Nagar,Balaji Layout, Kaggadasapura,Bengaluru, Karnataka 560093"}
              </p>
              <p className="text-[#000000] mt-2">
                <strong>Email:</strong>{" "}
                {siteConfig?.footerInfo?.email || "yumas.customercare@gmail.com"}
              </p>
              <p className="text-[#000000] mt-2">
                <strong>Phone:</strong>{" "}
                {siteConfig?.footerInfo?.phone || "+91 98765 43210"}
              </p>
            </div>
            <div className="bg-[#ffffff] p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-[#000000] mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/yumasfreshfoods?igsh=MW5raHFuNndqYWU1MA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#57ba40] hover:text-pink-600"
                >
                  <Instagram size={24} />
                </a>
                {/* <a
                  href={siteConfig?.footerInfo?.socials?.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#57ba40] hover:text-blue-600"
                >
                  <Facebook size={24} />
                </a> */}
                <a
                  href="https://www.youtube.com/@yumasfreshfoods"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#57ba40] hover:text-red-600"
                >
                  <Youtube size={24} />
                </a>
                <a
                  href="mailto:yumasfreshfoods@gmail.com"
                  className="text-[#57ba40] hover:text-purple-600"
                >
                  <Mail size={24} />
                </a>

                {/* Phone */}
                <a
                  href="tel:+919876543210"
                  className="text-[#57ba40] hover:text-blue-600"
                >
                  <Phone size={24} />
                </a>
                {/* <a
                  href={siteConfig?.footerInfo?.socials?.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#57ba40] hover:text-blue-500"
                >
                  < size={24} />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
