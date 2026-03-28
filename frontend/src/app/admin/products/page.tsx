"use client";
import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  conditionGrade: string;
  stockQuantity: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const getHeaders = () => {
    const userStr = localStorage.getItem('nexis_user');
    const token = userStr ? JSON.parse(userStr).token : '';
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchProducts = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setProducts(data || []))
      .catch(console.error);
  };

  useEffect(() => { fetchProducts(); }, []);


  const deleteProduct = async (id: number) => {
    if (!confirm('Force Delete this product completely? This action cannot be undone.')) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/${id}`, { method: 'DELETE', headers: getHeaders() });
    fetchProducts();
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-slate-800">Content Moderation</h3>
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Condition</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500">{p.id}</td>
                <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                <td className="p-4 text-slate-600">{p.category}</td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-200 text-slate-800 rounded text-xs font-bold">{p.conditionGrade}</span></td>
                <td className="p-4">
                  <span className={p.stockQuantity > 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>{p.stockQuantity}</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteProduct(p.id)} className="px-3 py-1 bg-rose-500 text-white hover:bg-rose-600 rounded text-sm font-bold shadow transition">Force Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
