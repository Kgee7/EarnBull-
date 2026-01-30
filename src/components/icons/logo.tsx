import Image from "next/image";

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="EarnBull Logo"
      width={100}
      height={100}
      className="rounded-full"
    />
  );
}
