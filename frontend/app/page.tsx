import UploadBox from "@/components/UploadBox";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="max-w-5xl mx-auto py-10 px-5">
        <div className="mb-6 flex justify-end">
  <ThemeToggle />
</div>
        <h1 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-10">
  AI CSV Importer
</h1>

        <UploadBox />
      </div>
    </main>
  );
}