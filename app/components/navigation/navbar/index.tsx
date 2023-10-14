import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import AvatarButton from "./AvatarButton";
import { Menu } from "lucide-react";

const Navbar = ({ toggle }: { toggle: () => void }) => {
  return (
    <>
      <div className="w-full h-20 bg-blue-600 sticky top-0">
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
                <Link href="https://docs.falkordb.com/">
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
