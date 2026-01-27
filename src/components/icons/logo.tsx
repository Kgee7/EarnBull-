import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g className="fill-primary dark:fill-primary-foreground">
        <path d="M50,15 C30,15 20,35 20,50 C20,70 35,85 50,85 C65,85 80,70 80,50 C80,35 70,15 50,15 Z M50,78 C38,78 28,68 28,50 C28,32 38,22 50,22 C62,22 72,32 72,50 C72,68 62,78 50,78 Z" />
        <path d="M42,50 a2,2 0 1,1 -4,0 a2,2 0 1,1 4,0" />
        <path d="M62,50 a2,2 0 1,1 -4,0 a2,2 0 1,1 4,0" />
        <path d="M50,60 C55,65 45,65 50,60" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" className="dark:stroke-primary-foreground"/>
      </g>
      <path
        d="M30,30 C15,10 35,15 30,30 Q25,35 20,40"
        className="fill-accent"
        transform="rotate(-5, 30, 30)"
      />
      <path
        d="M70,30 C85,10 65,15 70,30 Q75,35 80,40"
        className="fill-accent"
        transform="rotate(5, 70, 30)"
      />
    </svg>
  );
}
