"use client";

import { ReactNode } from "react";

export default function TokenSectionContainer({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="space-y-6">{children}</div>;
}
