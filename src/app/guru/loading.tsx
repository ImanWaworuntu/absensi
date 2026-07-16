import { Loader2 } from "lucide-react";
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Memuat data...</p>
      </div>
    </div>
  );
}
