// app/review/page.tsx
import Link from "next/link";
import { GiGloop } from "react-icons/gi";
import { LuTestTubeDiagonal } from "react-icons/lu";

export default function ReviewPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 pb-12 text-primary darker pt-32 leading-relaxed">
      <h1 className="text-3xl font-bold mb-4">Get Involved</h1>
      <p className="text-md mb-6">
        Help shape Mudboard as it grows. Whether you&apos;re down to test early
        features or just want to stay in the loop, we&apos;d love to have you
        here!
      </p>
      <Link
        href="https://forms.gle/QA96JUcRRP5YSqRT6"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-primary text-white px-5 py-2 mb-1
          rounded-lg hover:bg-accent transition-all duration-300 font-header"
      >
        Interest Form
      </Link>
      <p className="text-sm mb-12">4 questions</p>

      <section className="mb-12">
        <h2 className="flex gap-2 items-center text-xl font-semibold mb-2">
          {" "}
          <GiGloop />
          Stay in the Loop
        </h2>
        <p className="text-md mb-6">
          If you choose to sign up for updates, I talk about the features
          we&apos;ve been working on, any upcoming plans, and literally anything
          that comes to mind. It&apos;ll be fun! Updates happen every month or
          so.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="flex gap-2 items-center text-xl font-semibold mb-2">
          <LuTestTubeDiagonal />
          Be an Early Tester
        </h2>
        <p className="mb-2">
          Help make Mudboard better for everyone! You don&apos;t have to sign up
          officially to give feedback, but signing up is more for me to keep
          track of who I should send things to.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-md font-semibold mb-2">What to Expect</h2>
        <ul className="list-disc list-inside space-y-1 mb-6">
          <li>
            Every now and then I&apos;ll email out a short form or PDF that
            outlines a flow or feature
          </li>
          <li>It usually takes 20-30 mins (longer if you like me)</li>
          <li>
            No pressure; this isn&apos;t a job lol. Everything is optional
          </li>
        </ul>
        <p>Maybe I should start a Discord</p>
      </section>
    </main>
  );
}
