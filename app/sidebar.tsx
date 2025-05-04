import React from "react";

export default function Sidebar() {
  return (
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
  );
}
