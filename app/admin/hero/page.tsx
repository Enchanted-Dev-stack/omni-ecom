'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Loader2, 
  Edit, 
  Trash, 
  Eye, 
  EyeOff,
  GripVertical,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Image from 'next/image';
import HeroForm from './components/hero-form';

interface Hero {
  _id: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
  order: number;
}

export default function HeroPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/hero');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hero slides');
      }

      setHeroes(data.heroes);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching hero slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroes();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      const url = editingHero 
        ? `/api/admin/hero/${editingHero._id}` 
        : '/api/admin/hero';
      const method = editingHero ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to save hero slide');
      }

      fetchHeroes();
      setShowForm(false);
      setEditingHero(null);
    } catch (err: any) {
      console.error('Error saving hero slide:', err);
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/hero/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hero slide');
      }

      fetchHeroes();
    } catch (err: any) {
      console.error('Error deleting hero slide:', err);
      alert(err.message);
    }
  };

  const handleToggleActive = async (hero: Hero) => {
    try {
      const response = await fetch(`/api/admin/hero/${hero._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !hero.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update hero slide');
      }

      fetchHeroes();
    } catch (err: any) {
      console.error('Error updating hero slide:', err);
      alert(err.message);
    }
  };

  const handleReorder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/admin/hero/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder hero slides');
      }

      fetchHeroes();
    } catch (err: any) {
      console.error('Error reordering hero slides:', err);
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Hero Slides</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Slide
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Hero Slides List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : heroes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hero slides found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Button
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {heroes.map((hero, index) => (
                  <tr key={hero._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{hero.order + 1}</span>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleReorder(hero._id, hero.order - 1)}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReorder(hero._id, hero.order + 1)}
                            disabled={index === heroes.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-20 w-32 relative">
                        <Image
                          src={hero.image}
                          alt={hero.title}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{hero.title}</div>
                      {hero.subtitle && (
                        <div className="text-sm text-gray-500">{hero.subtitle}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hero.buttonText}</div>
                      <div className="text-sm text-gray-500">{hero.buttonLink}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          hero.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {hero.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleActive(hero)}
                        className="text-gray-600 hover:text-gray-900 mr-4"
                        title={hero.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {hero.isActive ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingHero(hero);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(hero._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hero Form Modal */}
      {showForm && (
        <HeroForm
          hero={editingHero}
          onClose={() => {
            setShowForm(false);
            setEditingHero(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
