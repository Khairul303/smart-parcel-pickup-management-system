import Image from "next/image";

import { cn } from "@/lib/utils";

type PostCentreTitleLogoProps = {
  className?: string;
};

export function PostCentreTitleLogo({ className }: PostCentreTitleLogoProps) {
  return (
    <Image
      src="/images/postcentre-logo.png"
      alt="PostCentre logo"
      width={240}
      height={80}
      priority
      className={cn("h-8 w-24 shrink-0 object-contain", className)}
    />
  );
}
