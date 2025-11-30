import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ensure this path matches your project structure
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // Assuming you want to keep this
import { Award, Users, Target } from "lucide-react";
import ThreeDHoverGallery from "../components/ThreeDHoverGallery"; 

// Import your story images
import simg1 from "../assets/simg1.jpg";
import simg2 from "../assets/simg2.jpg";
import simg3 from "../assets/simg3.jpg";
import simg4 from "../assets/simg4.jpg";
import simg5 from "../assets/simg5.jpg";

const AboutPage = () => {
  const [config, setConfig] = useState(null);
  const [content, setContent] = useState({
    aboutUs: "",
    mission: "",
    vision: "",
    journey: "",
    quotes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Main Configuration (Images, Team, Footer info)
        const configRef = doc(db, "siteConfiguration", "mainConfig");
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          setConfig(configSnap.data());
        }

        // 2. Fetch Text Content (About, Mission, Vision, Journey, Quotes)
        // These keys match the collection/doc IDs used in your AdminContent
        const [aboutSnap, missionSnap, visionSnap, journeySnap, quotesSnap] = await Promise.all([
          getDoc(doc(db, "siteContent", "aboutUs")),
          getDoc(doc(db, "siteContent", "mission")),
          getDoc(doc(db, "siteContent", "vision")),
          getDoc(doc(db, "siteContent", "journey")),
          getDoc(doc(db, "siteContent", "quotes")),
        ]);

        setContent({
          aboutUs: aboutSnap.exists() ? aboutSnap.data().text : "",
          mission: missionSnap.exists() ? missionSnap.data().text : "",
          vision: visionSnap.exists() ? visionSnap.data().text : "",
          journey: journeySnap.exists() ? journeySnap.data().text : "",
          quotes: quotesSnap.exists() ? quotesSnap.data().text : "",
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const siteConfigForFooter = config
    ? { footerInfo: config.footerInfo || {} }
    : { footerInfo: {} };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <Navbar />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <div className="relative h-[60vh] md:h-[70vh]">
            <img
              src={config?.aboutUsBannerImage || "/food_banner.png"}
              alt="About Us Banner"
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
                About Yuma Foods
              </h1>
              <p className="mt-4 text-xl md:text-2xl text-orange-50 max-w-2xl font-medium drop-shadow-md">
                Freshness, Quality, and Tradition Delivered to Your Doorstep
              </p>
            </div>
          </div>

          {/* Our Story & Journey Section */}
          <section className="py-20 bg-[#ffffff]">
            <div className="max-w-6xl mx-auto px-4 text-center">
              
              {/* About Us Content */}
              <h2 className="text-3xl md:text-4xl font-bold text-[#57ba40] mb-6">
                Our Story
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto mb-8 whitespace-pre-wrap">
                {content.aboutUs || "Welcome to Yuma Foods. We are dedicated to providing the best quality products."}
              </p>

              {/* Journey Content */}
              {content.journey && (
                <div className="mb-12">
                   <p className="text-gray-600 italic text-lg max-w-3xl mx-auto whitespace-pre-wrap">
                    "{content.journey}"
                  </p>
                </div>
              )}

              {/* 3D Hover Gallery Integration */}
              <div className="mt-10">
                <ThreeDHoverGallery
                  images={[simg1, simg2, simg3, simg4, simg5]}
                  itemWidth={12}
                  itemHeight={18}
                  hoverScale={12}
                  activeWidth={40}
                  autoPlay={true}
                  autoPlayDelay={4000}
                  grayscaleStrength={0.8}
                  brightnessLevel={0.6}
                />
              </div>
            </div>
          </section>

          {/* Mission, Vision & Quotes (Values) */}
          <section className="py-20 bg-[#ffffff] border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              
              {/* Mission */}
              <div className="flex flex-col items-center p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
                <Target className="w-16 h-16 text-[#57ba40] mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.mission || "Our mission is to deliver quality food to every household."}
                </p>
              </div>

              {/* Vision (Mapped to Center Column) */}
              <div className="flex flex-col items-center p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
                <Award className="w-16 h-16 text-[#57ba40] mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.vision || "We envision a world where healthy food is accessible to everyone."}
                </p>
              </div>

              {/* Quotes / Community (Mapped to Third Column) */}
              <div className="flex flex-col items-center p-6 rounded-xl hover:bg-orange-50 transition-colors duration-300">
                <Users className="w-16 h-16 text-[#57ba40] mb-6" />
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Values</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {content.quotes || "Community, Integrity, and Sustainability are at our core."}
                </p>
              </div>

            </div>
          </section>

          {/* Meet the Team */}
          {config?.teamMembers && config.teamMembers.length > 0 && (
            <section className="py-20 bg-orange-100">
              <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-4xl font-bold text-center text-orange-900 mb-16">
                  Meet the Team
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {config.teamMembers.map((member, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-center"
                    >
                      <div className="w-32 h-32 mx-auto mb-6 relative">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover border-4 border-orange-200"
                        />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h4>
                      <p className="text-orange-600 font-medium">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* <Footer config={siteConfigForFooter} /> */}
    </div>
  );
};

export default AboutPage;