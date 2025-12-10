import React from "react";
import Navbar from "../../components/Navbar"; // <-- update path if needed

const sectionStyle = "text-xl font-semibold mt-6 mb-2";
const paraStyle = "text-gray-700 leading-relaxed mb-4";
const listStyle = "list-disc ml-6 text-gray-700 leading-relaxed mb-4";

export default function Terms() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10 font-sans">
        <h1 className="text-4xl font-bold text-center mb-10 text-[#c0392b]">
          Yuma's Fresh Foods – Terms and Conditions
        </h1>

        {/* ================= TERMS & CONDITIONS ================= */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Terms & Conditions</h2>

          <h3 className={sectionStyle}>Introduction</h3>
          <p className={paraStyle}>
            At Yuma’s Fresh Foods, we value your privacy and are committed to protecting your personal information. We handle your data responsibly and transparently to maintain your trust. By accessing or using Yuma’s Fresh Foods website, you agree to the terms outlined in this policy, including how your information is collected, used, and shared.
          </p>

          <h3 className={sectionStyle}>Information We Collect</h3>
          <p className={paraStyle}>
            We collect and store the information you voluntarily submit on our website. If you do not wish to share any information, please refrain from submitting it. Any data you provide is used solely to enhance your browsing, shopping, and overall user experience.
          </p>

          <h3 className={sectionStyle}>General Visitor Information</h3>
          <p className={paraStyle}>For analytical and promotional purposes, we may collect basic visitor data such as:</p>
          <ul className={listStyle}>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Visit duration and timestamp</li>
            <li>Pages viewed</li>
          </ul>
          <p className={paraStyle}>
            This information helps us improve our services and may be used for marketing or performance analysis.
          </p>

          <h3 className={sectionStyle}>Cookies</h3>
          <p className={paraStyle}>
            Cookies are small data files stored in your browser. When you visit Yuma’s Fresh Foods, cookies help us:
          </p>
          <ul className={listStyle}>
            <li>Recognize your device</li>
            <li>Improve website functionality</li>
            <li>Offer a smoother, personalized experience</li>
          </ul>
          <p className={paraStyle}>
            You may disable cookies through your browser settings, though certain features may not function optimally.
          </p>

          <h3 className={sectionStyle}>Children’s Policy</h3>
          <p className={paraStyle}>
            To use our website, you must meet the legal minimum age requirements of your country.
          </p>

          <h4 className="text-lg font-semibold mt-4 mb-2">India</h4>
          <p className={paraStyle}>
            To use this Site, you must meet the minimum age requirement under Indian law. If you are under 18, you may use the Site only under the supervision of a parent, legal guardian, or a responsible adult. We do not intentionally collect personal data from children without appropriate consent.
          </p>

          <h4 className="text-lg font-semibold mt-4 mb-2">Other Countries</h4>
          <p className={paraStyle}>
            To use the Site, you must be of the minimum legal age as per the laws of your country.
          </p>
          <ul className={listStyle}>
            <li>For residents of the European Union, the minimum age is 16, unless local laws require higher age.</li>
            <li>In all other regions, if you are under the age of majority in your jurisdiction, you may use the Site only with parental or guardian supervision.</li>
          </ul>

          <h3 className={sectionStyle}>Changes to This Policy</h3>
          <p className={paraStyle}>
            Yuma’s Fresh Foods reserves the right to update or modify these Terms & Conditions at any time. Any changes will take effect immediately upon posting on the website.
          </p>

          <h3 className={sectionStyle}>Disclaimer</h3>
          <p className={paraStyle}>
            Yuma’s Fresh Foods is not responsible for any loss or damage resulting from:
          </p>
          <ul className={listStyle}>
            <li>Accidental or unauthorized disclosure of user account information</li>
            <li>Issues arising from online transactions involving debit/credit cards, payment verification, or data accuracy</li>
            <li>Any personal information you share voluntarily that is not specifically requested during account registration</li>
          </ul>
          <p className={paraStyle}>
            We operate with reasonable security measures; however, no data transmission over the internet is completely secure.
          </p>

          <h3 className={sectionStyle}>Contact Us</h3>
          <p className={paraStyle}>
            If you have any questions regarding these Terms & Conditions or your personal data protection, please contact us at: <br />
            📧 yumas.customercare@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
