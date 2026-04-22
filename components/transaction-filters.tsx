// components/transaction-filters.tsx
'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterState {
  searchTerm: string;
  status: 'all' | 'legitimate' | 'suspicious' | 'fraudulent';
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
  category: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    category: '',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      searchTerm: '',
      status: 'all',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      category: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== 'all').length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search transaction ID, customer name..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-border rounded-lg bg-background hover:bg-muted transition-colors flex items-center gap-2"
        >
          <Filter size={18} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="p-4 border border-border rounded-lg bg-muted/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="legitimate">Legitimate</option>
                <option value="suspicious">Suspicious</option>
                <option value="fraudulent">Fraudulent</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                <option value="groceries">Groceries</option>
                <option value="online">Online Shopping</option>
                <option value="gas">Gas Station</option>
                <option value="wire">Wire Transfer</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Max Amount</label>
              <input
                type="number"
                placeholder="10000"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-foreground font-medium flex items-center justify-center gap-2"
            >
              <X size={16} />
              Reset Filters
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
