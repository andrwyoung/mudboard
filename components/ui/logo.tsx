import Link from "next/link";
import Image from "next/image";

export default function Logo({
  color = "white",
}: {
  color?: "white" | "brown";
}) {
  return (
    <Link
      className="cursor-pointer hover:scale-105 transition-transform duration-300"
      href={"/"}
      title="Home Page"
    >
      <Image
        src={color === "white" ? "/full-logo-white.png" : "/full-logo.png"}
        alt="mudboard logo"
        height={387}
        width={1267}
        className="w-[150px]"
      />
    </Link>
  );
}
