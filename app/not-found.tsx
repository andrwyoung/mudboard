import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Image src="/2.png" alt="Board not found" width={375} height={150} />
      <h1 className="text-3xl font-bold mb-2 text-primary">Board not found</h1>
      <p className="text-muted-foreground mb-6 text-sm">
        The board you&apos;re looking for doesn&apos;t exist or has been
        deleted.
      </p>
      <Link
        href="/b/b92fe04b-01cd-4806-a1d3-9e108b9902e3"
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-lighter 
        hover:scale-105 transition-all duration-200
        flex flex-row gap-1 items-center"
      >
        <FaChevronLeft /> Back to Home
      </Link>
    </div>
  );
}
