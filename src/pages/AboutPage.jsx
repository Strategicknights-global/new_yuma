import React, { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 
import { Award, Users, Target } from "lucide-react";
import ThreeDHoverGallery from "../components/ThreeDHoverGallery";
import EcommerceTimeline from "./components/EcommerceTimeline";
import simg1 from "../assets/simg1.jpg";
import simg2 from "../assets/simg2.jpg";
import simg3 from "../assets/simg3.jpg";
import simg4 from "../assets/simg4.jpg";
import simg5 from "../assets/simg5.jpg";

export default function AboutPage() {
  const [config, setConfig] = useState(null);
  const [content, setContent] = useState({
    aboutUs: "",
    mission: "",
    vision: "",
    journey: "",
    quotes: "",
  });
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const [heroShift, setHeroShift] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHeroShift(Math.min(30, Math.max(-30, y * 0.06)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const configRef = doc(db, "siteConfiguration", "mainConfig");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setConfig(configSnap.data());
        }
        const keys = ["aboutUs", "mission", "vision", "journey", "quotes"];
        const docs = await Promise.all(
          keys.map((k) => getDoc(doc(db, "siteContent", k)))
        );

        const loaded = {};
        docs.forEach((snap, i) => {
          loaded[keys[i]] = snap.exists() ? (snap.data().text || "") : "";
        });

        setContent((c) => ({ ...c, ...loaded }));
      } catch (err) {
        console.error("Failed to load About page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const siteFooterConfig = config ? { footerInfo: config.footerInfo || {} } : {};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const aboutText =
    content.aboutUs ||
    "From a humble kitchen 2018 to 100+ wholesome products today-yuma's is where Tradition Meets Health";
  const missionText =
    content.mission || "Reving forgotten grains and recipes to bring back the taste and health of tradition";
  const visionText =
    content.vision ||
    "To make preservative-free , authentic foods a natural choice in every home";
  const journeyText = content.journey || "";
  const quotesText =
    content.quotes || "To make preservative-free , authentic foods a natural choice in every home";

  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      <Navbar />

      <header
        ref={heroRef}
        className="relative overflow-hidden"
        aria-label="About hero"
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,64,26,0.35), rgba(92,226,107,0.12)), url(" +
              (config?.aboutUsBannerImage || "/food_banner.png") +
              ") center/cover no-repeat",
            transform: `translateY(${heroShift}px)`,
            transition: "transform 0.08s linear",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/10">
                <span className="text-sm font-semibold text-green-50">About Us</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#07602e] leading-tight drop-shadow-md">
                Yuma's Foods — Freshness & Tradition
              </h1>

              <p className="mt-6 text-lg md:text-xl text-[#07602e] max-w-xl leading-relaxed">
                {aboutText}
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <article className="bg-white/90 rounded-2xl p-5 shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-200 to-yellow-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Our Mission</h4>
                    <p className="text-sm text-slate-700 mt-1">{missionText}</p>
                  </div>
                </div>
              </article>

              <article className="bg-white/90 rounded-2xl p-5 shadow-md hover:shadow-xl transition transform hover:-translate-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Our Vision</h4>
                    <p className="text-sm text-slate-700 mt-1">{visionText}</p>
                  </div>
                </div>
              </article>

              <article className="col-span-full sm:col-span-2 bg-white/90 rounded-2xl p-5 shadow-md hover:shadow-xl transition flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Our Values</h4>
                  <p className="text-sm text-slate-700 mt-1">{quotesText}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
        <svg
          className="-mb-1 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,40 C360,90 1080,-10 1440,40 L1440,80 L0,80 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </svg>
      </header>
   
      <section className="bg-[#ffffff] text-center py-6">
        <button
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-yellow-300 to-green-500 text-slate-900 font-semibold shadow-lg hover:scale-105 transition-transform"
                >
                  Explore Our Story
                </button>
              <h1 className="
  text-xl 
  sm:text-2xl 
  md:text-3xl 
  lg:text-[20px]
mt-8
  text-gray-800 
  leading-relaxed 
  text-center 
  px-4
  font-['Poppins']
">
  What began as a humble kitchen venture has now grown into <br></br>
  <span className="text-[#57ba40] font-bold"> 100+ healthy products</span>, <br></br>
  trusted by families who seek purity, authenticity, and nutrition.
</h1>

         <EcommerceTimeline/>
      
      </section>

      <section className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h3 className="text-lg font-semibold text-green-700">What Drives Us</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
            Mission, Vision & Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center mx-auto">
                <Target className="w-7 h-7 text-green-700" />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Mission</h4>
              <p className="mt-2 text-slate-700 text-sm">{missionText}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7 text-green-700" />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Vision</h4>
              <p className="mt-2 text-slate-700 text-sm">{visionText}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition transform hover:-translate-y-2">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-green-700" />
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">Values</h4>
              <p className="mt-2 text-slate-700 text-sm">{quotesText}</p>
            </div>
          </div>
        </div>
      </section>
      {config?.teamMembers && config.teamMembers.length > 0 && (
        <section id="team" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
              Meet the Team
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {config.teamMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="relative bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition"
                >
                  <div className="absolute -top-8 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="pt-12 text-center">
                    <h4 className="text-xl font-bold text-slate-900">{m.name}</h4>
                    <p className="mt-1 text-sm text-orange-600 font-medium">{m.role}</p>
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed">{m.bio}</p>

                    <div className="mt-5 flex items-center justify-center gap-3">
                      <a
                        href={m.linkedin || "#"}
                        aria-label={`${m.name} linkedin`}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M4 3h4v18H4zM6 0a2 2 0 11-.001 4.001A2 2 0 016 0zM10 8h4v2h.1c.6-1.1 2.1-2.3 4.3-2.3 4.6 0 5.4 3 5.4 6.9V21h-4v-6.5c0-1.6 0-3.6-2.2-3.6-2.2 0-2.6 1.8-2.6 3.5V21h-4V8z" fill="#0f5132"/>
                        </svg>
                      </a>
                      <a href={m.twitter || "#"} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow hover:scale-105 transition">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 5.9c-.6.3-1.2.5-1.9.6.7-.5 1.2-1.2 1.4-2.1-.7.4-1.5.7-2.4.9C18.5 4 17.3 3.5 16 3.5c-2.2 0-4 1.8-4 4 0 .3 0 .5.1.8C8.6 8 6 6.6 4.3 4.4c-.4.8-.6 1.6-.6 2.5 0 1.6.8 3.1 2 3.9-.5 0-1-.1-1.4-.4v.1c0 2.4 1.7 4.4 3.8 4.9-.4.1-.8.2-1.3.2-.3 0-.6 0-.9-.1.6 1.8 2.2 3.2 4.1 3.3-1.5 1.1-3.4 1.7-5.4 1.7-.4 0-.8 0-1.1-.1 2 1.3 4.4 2 6.9 2 8.3 0 12.8-6.9 12.8-12.8v-.6c.9-.6 1.6-1.4 2.1-2.3-.8.4-1.6.6-2.5.6z" fill="#0f5132"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-12 bg-gradient-to-r from-yellow-200 to-green-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Ready to taste the goodness?</h3>
            <p className="mt-1 text-slate-700">Order today and feel the freshness at your doorstep.</p>
          </div>
          <div className="flex gap-4">
            <a href="/products" className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-300 to-green-500 font-semibold shadow">
              Shop Now
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
