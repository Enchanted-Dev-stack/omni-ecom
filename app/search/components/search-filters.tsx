'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import FilterButton from '@/components/ui/filter-button';

const filters = {
  category: {
    label: 'Category',
    options: ['All Categories', 'Electronics', 'Clothing', 'Books', 'Home & Garden'],
  },
  sort: {
    label: 'Sort',
    options: [
      { label: 'Newest', value: 'newest' },
      { label: 'Price: Low to High', value: 'price_asc' },
      { label: 'Price: High to Low', value: 'price_desc' },
    ],
  },
  price: {
    label: 'Price',
    options: [
      { label: 'All Prices', value: 'all' },
      { label: 'Under €50', value: '0-50' },
      { label: '€50 - €100', value: '50-100' },
      { label: '€100 - €200', value: '100-200' },
      { label: 'Over €200', value: '200-' },
    ],
  },
};

export default function SearchFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (value === 'all' || value === 'All Categories') {
      current.delete(key.toLowerCase());
    } else {
      current.set(key.toLowerCase(), value);
    }
    
    // Preserve the search query
    const query = searchParams.get('q');
    if (query) current.set('q', query);
    
    router.push(`/search?${current.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {Object.entries(filters).map(([key, filter]) => (
        <FilterButton
          key={key}
          label={filter.label}
          value={searchParams.get(key.toLowerCase()) || (key === 'price' ? 'all' : key === 'sort' ? 'newest' : 'All Categories')}
          options={filter.options}
          onChange={(value) => handleFilterChange(key, value)}
        />
      ))}
    </div>
  );
}
