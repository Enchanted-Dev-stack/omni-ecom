'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, Loader2 } from 'lucide-react';
import Image from 'next/image';
import CategoryForm from './components/category-form';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
  };
  children?: Category[];
  status: 'active' | 'inactive';
  featured: boolean;
  slug: string;
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('query', searchTerm);
      if (selectedStatus !== 'All') queryParams.append('status', selectedStatus);

      const response = await fetch(`/api/admin/categories?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, selectedStatus]);

  const handleSubmit = async (formData: FormData) => {
    const isEditing = !!editingCategory;
    const url = isEditing 
      ? `/api/admin/categories/${editingCategory._id}` 
      : '/api/admin/categories';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }

      // Refresh categories list
      fetchCategories();
      
      // Close modal and reset editing state
      setShowAddModal(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      alert(err.message);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.message);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search categories..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {categories.map((category) => (
              <div
                key={category._id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <Image
                    src={category.image || '/images/placeholder.png'}
                    alt={category.name}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {category.name}
                      </h3>
                      {category.parent && (
                        <p className="text-sm text-gray-500">
                          Parent: {category.parent.name}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-gray-500 hover:text-indigo-600"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-gray-500 hover:text-red-600"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.status}
                    </span>
                    {category.featured && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                        Featured
                      </span>
                    )}
                    {category.children && category.children.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {category.children.length} subcategories
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showAddModal && (
        <CategoryForm
          category={editingCategory || undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
