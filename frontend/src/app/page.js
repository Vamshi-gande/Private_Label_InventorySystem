import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
      <Image src="/next.svg" alt="Next.js" width={160} height={36} className="dark:invert" priority />
      <h1 className="mt-8 text-4xl font-bold text-center text-gray-800 dark:text-gray-200">
        Private Label Inventory System
      </h1>
    </div>
  );
}
