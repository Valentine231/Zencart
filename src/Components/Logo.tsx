
import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative h-30 w-20 object-cover">
      <Image
        src="/ZenCart.png"
        alt="Zen Cart Logo"
        fill
        className="object-cover"
      />
    </div>
  );
}
