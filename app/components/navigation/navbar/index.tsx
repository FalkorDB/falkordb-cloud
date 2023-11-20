import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import AvatarButton from "./AvatarButton";
import { Menu } from "lucide-react";

const Navbar = ({ toggle }: { toggle: () => void }) => {
  return (
    <>
      <div className="w-full h-20 bg-blue-600 sticky top-0">
        <div className="absolute top-4 left-4 lg:top-8 lg:left-8 transform -translate-x-1/2 -translate-y-1/2">
          <div className="transform rotate-[315deg] bg-red-500 text-white px-10 py-1 text-xs font-bold uppercase tracking-wider shadow-lg">
            Beta
          </div>
        </div>
        <div className="container mx-auto px-4 h-full">
          <div className="flex justify-between items-center h-full">
            <Logo />
            <button
              type="button"
              className="inline-flex items-center md:hidden"
              onClick={toggle}
            >
              <Menu className="text-white"/>
            </button>
            <ul className="hidden md:flex gap-x-6 text-slate-50">
              <li>
                <Link href="/">
                  <p>Home</p>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <p>Pricing</p>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <p>Support</p>
                </Link>
              </li>
              <li>
                <Link href="https://docs.falkordb.com/" target="_blank" rel="noopener noreferrer">
                  <p>Documentation</p>
                </Link>
              </li>
            </ul>
            <div className="hidden md:block">
              <AvatarButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
