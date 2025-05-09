import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="inline-flex items-center bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
        <button 
          onClick={() => onPageChange('first')}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'} transition-colors`}
          aria-label="İlk Sayfa"
        >
          <ChevronsLeft size={20} />
        </button>
        
        <button 
          onClick={() => onPageChange('prev')}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-10 h-10 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'} transition-colors`}
          aria-label="Önceki Sayfa"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="px-4 h-10 flex items-center justify-center bg-gray-900 border-x border-gray-700">
          <span className="font-mono text-sm">
            Sayfa <span className="font-bold text-indigo-400">{currentPage}</span> / {totalPages}
          </span>
        </div>
        
        <button 
          onClick={() => onPageChange('next')}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'} transition-colors`}
          aria-label="Sonraki Sayfa"
        >
          <ChevronRight size={20} />
        </button>
        
        <button 
          onClick={() => onPageChange('last')}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-10 h-10 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'} transition-colors`}
          aria-label="Son Sayfa"
        >
          <ChevronsRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;