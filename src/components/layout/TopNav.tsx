import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4 bg-[#0A0A0A] sticky top-0 z-10">
      <h1 className="font-display text-3xl tracking-wide">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 w-64">
          <Search className="h-4 w-4 text-[#8A8A8A]" />
          <input
            placeholder="Search members…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-[#8A8A8A]"
          />
        </div>
        <Button variant="outline" size="icon" className="border-[#222222] bg-[#111111] hover:bg-[#1A1A1A]">
          <Bell className="h-4 w-4" />
        </Button>
        {action}
        <div className="h-9 w-9 rounded-full bg-[#E02020] flex items-center justify-center text-sm font-semibold">
          AK
        </div>
      </div>
    </header>
  );
}
