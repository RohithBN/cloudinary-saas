'use client'
import React from 'react';

const Navlinks = [
  {
    title: "Home",
    href: "/"
  },
  {
    title: "Videos",
    href: "/videos"
  },
  {
    title: "Social Share",
    href: "/social-share"
  },
  {
    title: "Upload Video",
    href: "/video-upload"
  }
];

const Sidebar = () => {
  const url = window.location.href;

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold text-center mb-6">My App</h2>
        <ul>
          {Navlinks.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className={`block py-3 px-4 rounded-md text-lg transition-all 
                  ${url.includes(link.href) 
                    ? "bg-blue-600 text-white" // Active link styles
                    : "text-gray-400 hover:bg-blue-500 hover:text-white"} 
                  hover:cursor-pointer`}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
