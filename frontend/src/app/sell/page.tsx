"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Mobiles & Electronics',
    conditionGrade: 'Like New',
    warrantyMonths: '0',
    accessoriesIncluded: '',
    stockQuantity: '1',
    imageUrl: '',
    sellerId: 1 // Default fallback
  });

  useEffect(() => {
    const userStr = localStorage.getItem('nexis_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      setFormData(prev => ({ ...prev, sellerId: u.id }));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          warrantyMonths: parseInt(formData.warrantyMonths, 10),
          stockQuantity: parseInt(formData.stockQuantity, 10)
        }),
      });

      if (response.ok) {
        alert("Product successfully listed! You will receive an SMS and Email confirmation shortly.");
        router.push('/');
      } else {
        alert("Failed to list product. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      alert("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-[16rem])] bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sell a product
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Turn your refurbished goods into cash.
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
                  placeholder="e.g., Refurbished iPhone 13 Pro Max"
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
                    placeholder="0.00"
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
                    placeholder="e.g., Charger, Box"
                    className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-3 sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex flex-col space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-2xl mb-2">📸</span>
                      <p className="mb-2 text-sm text-gray-500 font-semibold italic">Click to upload image</p>
                      <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const formData = new FormData();
                        formData.append('file', file);
                        
                        try {
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                            method: 'POST',
                            body: formData
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setFormData(prev => ({ ...prev, imageUrl: data.url }));
                          } else {
                            alert("Upload failed.");
                          }
                        } catch {
                          alert("Error uploading file.");
                        }
                      }}
                    />
                  </label>
                </div>
                
                {formData.imageUrl && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                    <Image 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      fill
                      className="object-contain bg-slate-50"
                      onError={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      unoptimized
                    />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-50 text-xs text-gray-500">OR PROVIDE URL</span>
                  </div>
                </div>

                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 py-2 px-3 border"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-[10px] text-gray-400 italic">
                  Tip: Right-click an image on the web and select &quot;Copy image address&quot;. The link should end in .jpg, .png, or .webp
                </p>
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
                  placeholder="Describe the item, any signs of wear, accessories included, etc."
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-4">
              <Link
                href="/"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-slate-900 bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Listing...' : 'List Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
