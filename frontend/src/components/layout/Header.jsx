import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Inventory System
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/inventory" className="text-gray-600 hover:text-gray-900">
              Inventory
            </Link>
            <Link href="/reservations" className="text-gray-600 hover:text-gray-900">
              Reservations
            </Link>
            <Link href="/classification" className="text-gray-600 hover:text-gray-900">
              Classification
            </Link>
            <Link href="/manager-actions" className="text-gray-600 hover:text-gray-900">
              Manager Actions
            </Link>
            <Link href="/consensus" className="text-gray-600 hover:text-gray-900">
              Consensus
            </Link>
            <Link href="/queue" className="text-gray-600 hover:text-gray-900">
              Queue
            </Link>
            <Link href="/contribution" className="text-gray-600 hover:text-gray-900">
              Contribution
            </Link>
            <Link href="/warehouse-transfer" className="text-gray-600 hover:text-gray-900">
              Transfers
            </Link>
            <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
              Analytics
            </Link>
            <Link href="/demo" className="text-gray-600 hover:text-gray-900">
              Demo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
