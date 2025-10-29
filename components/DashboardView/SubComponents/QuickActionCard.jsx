import React from 'react';
import Link from 'next/link';

const QuickActionCard = ({ title, description, icon, onClick, href  }) => {
  
  return (
    <Link href={href}>
      <button
        onClick={onClick}
        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left w-full"
      >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
    </Link>
  );
};

export default QuickActionCard;