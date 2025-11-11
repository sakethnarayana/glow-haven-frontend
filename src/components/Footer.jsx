import React from 'react';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-12">
      <div className="container mx-auto px-6 text-center md:text-left grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-serif mb-2">GlowHaven</h3>
          <p className="text-gray-400 text-sm">
            Embrace your natural glow with expert beauty and skincare care.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">📍 Address</h4>
          <p className="text-gray-400 text-sm">
            123 Serenity Avenue<br />
            Blossom City, CA 90001
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-gray-400 text-sm">📞 +1 (234) 567-8901</p>
          <a
            href="https://www.instagram.com/glowhaven"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-pink-400 hover:text-pink-300 transition"
          >
            <FaInstagram /> Follow us on Instagram
          </a>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-500 text-xs border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} GlowHaven Beauty Salon. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
