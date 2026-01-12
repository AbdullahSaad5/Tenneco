"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="absolute top-4 left-4 right-4 rounded-2xl lg:rounded-3xl px-4 md:px-6 lg:px-8 py-4 bg-white/75 z-10 pointer-events-auto h-[6vh] md:h-[8vh] lg:h-[10vh] backdrop-blur-[.15em] shadow-[.1em_.17em_.17em_#0000004d]">
      <div className="flex justify-between items-stretch h-full">
        <div className="h-full relative w-36 md:w-44 lg:w-56">
          <Link href="/">
            <Image src="/tenneco-logo.png" alt="Logo" className="h-8 object-contain" fill priority />
          </Link>
        </div>
        <div className="h-full flex items-center space-x-2 sm:space-x-6 lg:space-x-8 text-lg">
          {/* Navigation buttons can be added here */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
