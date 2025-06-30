function TestimonialCard({
  children,
  author,
}: {
  children: React.ReactNode;
  author: string;
}) {
  return (
    <div className="bg-primary/20 rounded-lg text-white">
      <p className="italic mb-2">{children}</p>
      <p className="font-semibold text-[0.85rem] ">— {author}</p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-0 mb-36 flex flex-col items-center">
      {/* <h2 className="text-xl font-semibold mb-2"></h2> */}
      <div className="h-px bg-stone-300 w-8 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm sm:text-base">
        <TestimonialCard author="Cecilia Y, concept artist">
          It&apos;s great that everything is in one place! It&apos;s clear this
          was made by an artist.
        </TestimonialCard>
        <TestimonialCard author="Jonathan, art tutor">
          I love being able to reuse and find my references easily. The
          eyedropper is especially nice.
        </TestimonialCard>
        <TestimonialCard author="Jenneth L, illustrator">
          Mudboard is such a cool resource for creatives. The interface is so
          intuitive!
        </TestimonialCard>
      </div>
    </section>
  );
}
