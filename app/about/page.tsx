import React from "react";

export default function AboutPage() {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <p className="text-primary max-w-lg font-medium">
        Mudboard, the company, will{" "}
        <span className="font-semibold">never use any images or data</span>{" "}
        collected from users to train AI models. Nor will we sell such user data
        like emails, behavior, or usage patterns in effort to advertise or
        market.
        <br />
        <br />
        We are open to using AI to help the app perform, such as helping you
        search for images. But this is done{" "}
        <span className="font-semibold">without feeding data back</span> into AI
        models; your data remains untouched.
        <br />
        <br />- <span className="font-semibold">Andrew Yong</span>. July 8th,
        2025
      </p>
    </div>
  );
}
