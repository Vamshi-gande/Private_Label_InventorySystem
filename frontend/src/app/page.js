'use client';

import Link from 'next/link';
import { Button } from '@/components';
import { useHealth } from '@/hooks';

export default function Home() {
  const { data, isLoading, isError } = useHealth();

  return (
    <div className="text-center space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Private Label Inventory System</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          AI-driven platform for optimizing private label product allocation.
        </p>
      </div>

      <div className="text-sm">
        {isLoading && <p className="text-gray-600">Checking backend health...</p>}
        {isError && <p className="text-red-600">Backend is unreachable</p>}
        {data && <p className="text-green-700 font-medium">Backend status: {data.status}</p>}
      </div>

      <Link href="/dashboard">
        <Button variant="primary" size="lg">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
