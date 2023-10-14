import Link from "next/link";
import AvatarButton from "../navbar/AvatarButton";
import { X } from "lucide-react";

const Sidebar = ({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}): JSX.Element => {
  return (
    <>
      <div
        className="sidebar-container fixed w-full h-full overflow-hidden justify-center bg-blue-600 grid pt-[120px] left-0 z-10"
        style={{
          opacity: `${isOpen ? "1" : "0"}`,
          top: ` ${isOpen ? "0" : "-100%"}`,
        }}
      >
        <button className="absolute right-0 p-5" onClick={toggle}>
        {/* Close icon */}
          <X  className="text-white"/>
        </button>

        <ul className="sidebar-nav text-center leading-relaxed text-xl text-slate-50">
          <li>
              <AvatarButton />
          </li>
          <li>
            <Link href="/" onClick={toggle}><p>Home</p></Link>
          </li>
          <li>
            <Link href="/pricing" onClick={toggle}><p>Pricing</p></Link>
          </li>
          <li>
            <Link href="/support" onClick={toggle}><p>Support</p></Link>
          </li>
          <li>
            <Link href="https://docs.falkordb.com/"><p>Documentation</p></Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;