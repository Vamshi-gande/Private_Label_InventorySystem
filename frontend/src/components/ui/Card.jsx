export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
} 