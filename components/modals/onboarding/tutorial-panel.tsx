import { useDemoStore } from "@/store/demo-store";

export default function TutorialPanel() {
  const isDemo = useDemoStore((s) => s.isDemoBoard);

  return (
    <>
      {isDemo && (
        <div className="hidden sm:block absolute right-6 bottom-4 h-48 w-64 bg-background shadow-lg z-60 rounded-lg">
          <div className="flex flex-col px-4 py-2 text-primary">
            <h1 className="font-semibold self-center">Things to Try Out</h1>
          </div>
        </div>
      )}
    </>
  );
}
