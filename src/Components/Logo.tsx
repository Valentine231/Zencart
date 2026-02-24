import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative h-12 w-36 sm:h-14 sm:w-40 rounded-xl bg-white/5 backdrop-blur-sm p-2 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
      <Image
        src="/ZenCart.png"
        alt="Zen Cart Logo"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}