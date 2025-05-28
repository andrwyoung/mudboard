import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link
      className="cursor-pointer hover:scale-105 transition-transform duration-300"
      href={"/"}
    >
      <Image
        src={"/full-logo-white.png"}
        alt="mudboard logo"
        height={387}
        width={1267}
        className="w-[150px]"
      />
    </Link>
  );
}
