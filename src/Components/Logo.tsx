import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-white shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden border border-emerald-100">
      <Image
        src="/ZenCartModern.png"
        alt="Zen Cart Logo"
        fill
        priority
        className="object-contain p-1"
      />
    </div>
  );
}