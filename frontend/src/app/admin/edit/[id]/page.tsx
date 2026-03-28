"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<{role: string; token: string} | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Mobiles & Electronics',
    conditionGrade: 'Like New',
    warrantyMonths: '0',
    accessoriesIncluded: '',
    stockQuantity: '1',
    imageUrl: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if(u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN') {
        router.push('/');
        return;
      }
      setCurrentUser(u);
      
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '0',
            category: data.category || 'Mobiles & Electronics',
            conditionGrade: data.conditionGrade || 'Like New',
            warrantyMonths: data.warrantyMonths?.toString() || '0',
            accessoriesIncluded: data.accessoriesIncluded || '',
            stockQuantity: data.stockQuantity?.toString() || '1',
            imageUrl: data.imageUrl || ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching product:", err);
          alert("Failed to load product.");
          router.push('/');
        });
    } else {
      router.push('/login');
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          warrantyMonths: parseInt(formData.warrantyMonths, 10),
          stockQuantity: parseInt(formData.stockQuantity, 10)
        }),
      });

      if (response.ok) {
        alert("Product successfully updated!");
        router.push(`/product/${id}`);
      } else {
        alert("Failed to update product. Please try again.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  if(loading) return <div className="text-center py-20 text-gray-700">Loading product data...</div>;

  return (
    <div className="min-h-[calc(100vh-[16rem])] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Edit Content
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Modify the details for this public listing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Title <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="text-gray-900 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="text-gray-900 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option>Mobiles & Electronics</option>
                    <option>Laptops & Accessories</option>
                    <option>Home Appliances</option>
                    <option>Furniture</option>
                    <option>Fashion & Wearables</option>
                    <option>Sports Equipment</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="conditionGrade" className="block text-sm font-medium text-gray-700">
                  Condition Grade <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="conditionGrade"
                    name="conditionGrade"
                    value={formData.conditionGrade}
                    onChange={handleChange}
                    className="text-gray-900 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                  >
                    <option>Like New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="warrantyMonths" className="block text-sm font-medium text-gray-700">
                  Warranty (Months)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="warrantyMonths"
                    id="warrantyMonths"
                    min="0"
                    value={formData.warrantyMonths}
                    onChange={handleChange}
                    className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="stockQuantity"
                    id="stockQuantity"
                    required
                    min="1"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="accessoriesIncluded" className="block text-sm font-medium text-gray-700">
                  Accessories Included
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="accessoriesIncluded"
                    id="accessoriesIncluded"
                    value={formData.accessoriesIncluded}
                    onChange={handleChange}
                    className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL (Optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 py-2 px-3"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="text-gray-900 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-4">
              <Link
                href={`/product/${id}`}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-slate-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
