'use client';

import Image from 'next/image';
import { Button } from '@/components';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8 gap-8">
      <Image src="/next.svg" alt="Next.js" width={160} height={36} className="dark:invert" priority />
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">
        Private Label Inventory System
      </h1>
      <Button variant="primary" size="lg" onClick={() => alert('Wassup')}>
        Button
      </Button>
    </div>
  );
}
