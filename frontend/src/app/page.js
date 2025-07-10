'use client';

import Image from 'next/image';
import { Button } from '@/components';
import { useHealth } from '@/hooks';

export default function Home() {
  const { data, isLoading, isError } = useHealth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8 gap-8">
      <Image
        src="/next.svg"
        alt="Next.js"
        width={160}
        height={36}
        className="dark:invert"
        priority
      />
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200">
        Private Label Inventory System
      </h1>
      {isLoading && <p className="text-gray-600">Checking backend health...</p>}
      {isError && <p className="text-red-600">Backend is unreachable</p>}
      {data && <p className="text-green-700 font-medium">Backend status: {data.status}</p>}
      <Button variant="primary" size="lg" onClick={() => alert('Wassup')}>
        Button
      </Button>
    </div>
  );
}
