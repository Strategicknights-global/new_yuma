import logo from '../assets/logo.png';
import { Link } from "react-router-dom";
import { MapPin, Mail, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import React from 'react';

const Footer = () => (
  <footer className="bg-[#1a1a1a] text-gray-300 py-10">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between">
      
      <div className="mb-8 md:mb-0 text-center md:text-left">
        <img
          src={logo}
          alt="Yuma's Fresh Foods Logo"
          className="w-32 mb-4 mx-auto md:mx-0"
        />

        <div className="flex items-start justify-center md:justify-start mb-2">
          <MapPin className="w-4 h-4 mr-2 mt-1" />
          <div className="text-sm text-left">
            <p>29th Cross Rd, Kondappa Layout, C.V. Raman Nagar,</p>
            <p> Balaji Layout, Kaggadasapura, </p>
              <p> Bengaluru, Karnataka 560093</p>
              <br></br>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-start mb-2">
          <Mail className="w-4 h-4 mr-2" />
          <p className="text-sm">yumasfreshfood@gmail.com</p>
        </div>

        <button className="bg-[#57ba40] text-white px-4 py-2 mt-4 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors">
          <a
            href="https://wa.me/919663208248"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here to chat on Whatsapp
          </a>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row justify-around text-center md:text-left">
        <div className="mb-6 md:mb-0">
          <h4 className="font-bold text-lg mb-4 text-white">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">Why Yuma's Fresh Foods?</Link></li>
            <li><Link to="/home" className="hover:underline">Home</Link></li>
            <li><Link to="/testimonials" className="hover:underline">Testimonials</Link></li>
            <li><Link to="/products" className="hover:underline">Products</Link></li>
            <li><Link to="/delivery" className="hover:underline">FAQs</Link></li>
            
          </ul>
        </div>

        <div className="mb-6 md:mb-0">
          <h4 className="font-bold text-lg mb-4 text-white">Our Policy</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/policies" className="hover:underline">Policies</Link></li>
            <li><Link to="/policies" className="hover:underline">Terms and Conditions</Link></li>
            <li><Link to="/delivery" className="hover:underline">Delivery Information</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact us</Link></li>
           
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-4 text-white">Follow us on</h4>
          <div className="flex justify-center md:justify-start space-x-4 mb-6">
            <Instagram className="w-6 h-6 hover:text-gray-100" />
            <Facebook className="w-6 h-6 hover:text-gray-100" />
            <Youtube className="w-6 h-6 hover:text-gray-100" />
            <Linkedin className="w-6 h-6 hover:text-gray-100" />
            <Twitter className="w-6 h-6 hover:text-gray-100" />
          </div>

          <h4 className="font-bold text-lg mb-2 text-white">My Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/profile" className="hover:underline">My Profile</Link></li>
            <li><Link to="/orders" className="hover:underline">Order History</Link></li>
          </ul>
        </div>
      </div>
    </div>

    {/* CENTERED BORDER + COPYRIGHT */}
    <div className="mt-10">
      {/* Only middle border (not full width) */}
      <div className="border-t border-gray-700 w-3/4 mx-auto"></div>

      <p className="mt-1 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} 
        <span className="text-red-500 font-semibold"> Yuma's Fresh Foods</span>. 
        All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;