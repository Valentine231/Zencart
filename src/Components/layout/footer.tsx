import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Zencart. All rights reserved. |{" "}
      <Link href="/admin-login" className="hover:text-blue-600 transition-colors">
        Admin
      </Link>
    </footer>
  );
}
