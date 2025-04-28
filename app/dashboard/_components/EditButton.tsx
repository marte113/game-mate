"use client";

import { useRouter , usePathname } from "next/navigation";

import { Button } from "@/components/ui";

export default function EditButton({ currentTab }: { currentTab: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Button variant="outline" className="rounded-full" onClick={() => handleTabChange("profileEdit")}>
      프로필 수정
    </Button>
  );
}
