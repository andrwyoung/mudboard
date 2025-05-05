import Image from "next/image";
import React from "react";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex justify-center py-8 px-4">
        <Image
          src={"/full-logo-white.png"}
          alt="mudboard logo"
          height={387}
          width={1267}
          className="w-[200px]"
        ></Image>
      </div>
      <div className="flex flex-col flex-grow justify-center items-center px-4">
        <div className="flex flex-col">
          <h1 className="text-3xl mb-12 font-bold">Art Room</h1>
          <div className="space-y-2 text-xl">
            <div className="font-semibold">• Newsletter</div>
            <div className="font-semibold">• Main Site</div>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col items-center px-4 py-4 
      font-mono font-semibold mt-auto text-md pt-12 text-primary-foreground"
      >
        &copy; {new Date().getFullYear()} Andrew Yong
      </div>
    </div>
  );
}
