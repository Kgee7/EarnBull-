import Image from "next/image";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="https://picsum.photos/seed/earnbull/100/100"
      alt="EarnBull Logo"
      width={100}
      height={100}
      data-ai-hint="bull money"
      className="rounded-full"
      {...props}
    />
  );
}
