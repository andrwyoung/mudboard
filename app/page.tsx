import { grabOrderedImages } from "@/lib/grabImages";
import Gallery from "./gallery";

export default function Home() {
  const orderedImages = grabOrderedImages();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-1/5 min-w-[200px] max-w-[380px] h-full 
      flex flex-col items-start justify-center bg-primary pl-4 sm:pl-8 xl:pl-16"
      >
        <div className="">
          <h1 className="text-4xl mb-6">Art Room</h1>
          <ul className="space-y-2 font-light">
            <li className="">• Newsletter</li>
            <li className="">• Main Site</li>
          </ul>
          <div className="font-mono mt-auto text-xs pt-12 text-slate-700">
            &copy; {new Date().getFullYear()} Andrew Yong
          </div>
        </div>
      </aside>

      {/* Gallery */}
      <main className="flex-1 overflow-y-scroll scrollbar-none">
        <Gallery imgs={orderedImages} />
      </main>
    </div>
  );
}
