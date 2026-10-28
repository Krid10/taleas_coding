import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & Filter state
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchId, setSearchId] = useState('');
  const [singleItemResult, setSingleItemResult] = useState(null);
  const [idSearchError, setIdSearchError] = useState('');

  // Form states (Create)
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('');

  // Edit states (Update)
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const params = {};
      if (searchName) params.name = searchName;
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await axios.get(`${API_BASE}/items`, { params });
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, [searchName, selectedCategory]);

  useEffect(() => {
    let ignore = false;
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        if (!ignore) setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadFilteredItems = async () => {
      try {
        const params = {};
        if (searchName) params.name = searchName;
        if (selectedCategory) params.categoryId = selectedCategory;
        const res = await axios.get(`${API_BASE}/items`, { params });
        if (!ignore) setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadFilteredItems();
    return () => {
      ignore = true;
    };
  }, [searchName, selectedCategory]);

  // Create Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await axios.post(`${API_BASE}/categories`, { name: catName, image: catImage });
      setCatName('');
      setCatImage('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add category');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice || !itemCategory) return;
    try {
      await axios.post(`${API_BASE}/items`, {
        name: itemName,
        unit: itemUnit,
        price: Number(itemPrice),
        image: itemImage,
        categoryId: itemCategory,
      });
      setItemName('');
      setItemPrice('');
      setItemImage('');
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add item');
    }
  };

  // Update Handlers
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory?.name.trim()) return;
    try {
      await axios.put(`${API_BASE}/categories/${editingCategory._id}`, {
        name: editingCategory.name,
        image: editingCategory.image,
      });
      setEditingCategory(null);
      fetchCategories();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update category');
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem?.name.trim() || !editingItem?.price || !editingItem?.categoryId) return;
    try {
      await axios.put(`${API_BASE}/items/${editingItem._id}`, {
        name: editingItem.name,
        unit: editingItem.unit,
        price: Number(editingItem.price),
        image: editingItem.image,
        categoryId: editingItem.categoryId,
      });
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update item');
    }
  };

  // Delete Handlers
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? Items referencing this category may be affected.')) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      fetchCategories();
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to delete category');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE}/items/${id}`);
      if (singleItemResult && singleItemResult._id === id) {
        setSingleItemResult(null);
      }
      fetchItems();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item');
    }
  };

  // Search by ID
  const handleFindById = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIdSearchError('');
    setSingleItemResult(null);

    try {
      const res = await axios.get(`${API_BASE}/items/${searchId.trim()}`);
      setSingleItemResult(res.data);
    } catch (err) {
      console.error(err);
      setIdSearchError('Item not found with this ID');
    }
  };

  return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Marketplace Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Manage categories, inventory items, and relations</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <a
                href="http://localhost:5000/api-docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 shadow-sm"
            >
              <span>Swagger API Docs</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </header>

        {/* Main Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 space-x-4">
          <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`pb-3 px-4 text-base font-medium transition-colors border-b-2 ${
                  activeTab === 'items'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            Items Bar ({items.length})
          </button>
          <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`pb-3 px-4 text-base font-medium transition-colors border-b-2 ${
                  activeTab === 'categories'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            Categories Bar ({categories.length})
          </button>
        </div>

        {/* ======================= TAB 1: ITEMS BAR ======================= */}
        {activeTab === 'items' && (
            <div className="space-y-8">
              {/* SECTION 1: CREATE ITEM */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Create Item
                </h2>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Item Name *</label>
                      <input
                          type="text"
                          placeholder="e.g. Wireless Mouse"
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit *</label>
                        <input
                            type="text"
                            placeholder="pcs, kg, box"
                            value={itemUnit}
                            onChange={(e) => setItemUnit(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price *</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL (Optional)</label>
                      <input
                          type="text"
                          placeholder="https://images.com/example.jpg"
                          value={itemImage}
                          onChange={(e) => setItemImage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category *</label>
                      <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
                  >
                    + Add Item
                  </button>
                </form>
              </section>

              {/* SECTION 2: LOOKUP BY ID */}
              <section className="bg-slate-100 rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Lookup Item by ID (GET /api/items/:id)</h3>
                <form onSubmit={handleFindById} className="flex gap-2">
                  <input
                      type="text"
                      placeholder="Enter exact 24-character MongoDB _id..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Fetch
                  </button>
                  {singleItemResult && (
                      <button
                          type="button"
                          onClick={() => { setSearchId(''); setSingleItemResult(null); setIdSearchError(''); }}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg"
                      >
                        Clear
                      </button>
                  )}
                </form>
                {idSearchError && <p className="text-rose-600 text-xs mt-2 font-medium">{idSearchError}</p>}

                {singleItemResult && (
                    <div className="mt-3 p-4 bg-white border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Result Match</span>
                        <p className="font-bold text-slate-900">{singleItemResult.name} — ${singleItemResult.price} / {singleItemResult.unit}</p>
                        <p className="text-xs text-slate-400 font-mono">ID: {singleItemResult._id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setEditingItem({ ...singleItemResult, categoryId: singleItemResult.categoryId?._id || singleItemResult.categoryId })}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-semibold"
                        >
                          Update
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteItem(singleItemResult._id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-md text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                )}
              </section>

              {/* SECTION 3: ITEMS LIST & MANAGE (UPDATE / DELETE) */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Items List & Operations</h2>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Filter by name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {items.map((item) => (
                      <div key={item._id} className="border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50 hover:shadow-md transition-shadow">
                        <div className="h-40 bg-slate-200 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-xs text-slate-400 font-medium">No Image</span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 w-fit mb-2">
                      {item.categoryId?.name || 'Uncategorized'}
                    </span>
                          <h3 className="font-bold text-slate-800 text-base leading-snug">{item.name}</h3>
                          <p className="text-xs font-mono text-slate-400 mt-0.5 mb-2 truncate">ID: {item._id}</p>
                          <p className="text-lg font-black text-slate-900 mt-auto">
                            ${item.price} <span className="text-xs font-normal text-slate-500">/ {item.unit}</span>
                          </p>

                          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setEditingItem({ ...item, categoryId: item.categoryId?._id || item.categoryId })}
                                className="py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-slate-300 hover:border-blue-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Update
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteItem(item._id)}
                                className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
                {items.length === 0 && <p className="text-slate-400 text-sm py-4">No items found matching the criteria.</p>}
              </section>
            </div>
        )}

        {/* ===================== TAB 2: CATEGORIES BAR ===================== */}
        {activeTab === 'categories' && (
            <div className="space-y-8">
              {/* SECTION 1: CREATE CATEGORY */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Create Category
                </h2>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category Name *</label>
                      <input
                          type="text"
                          placeholder="e.g. Electronics, Books"
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL (Optional)</label>
                      <input
                          type="text"
                          placeholder="https://images.com/category.jpg"
                          value={catImage}
                          onChange={(e) => setCatImage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
                  >
                    + Add Category
                  </button>
                </form>
              </section>

              {/* SECTION 2: CATEGORIES LIST & MANAGE (UPDATE / DELETE) */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Categories List & Operations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {categories.map((cat) => (
                      <div key={cat._id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                        <div className="h-32 bg-slate-200 flex items-center justify-center overflow-hidden">
                          {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-xs text-slate-400 font-medium">No Image</span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-800 text-base">{cat.name}</h3>
                          <p className="text-xs font-mono text-slate-400 mt-0.5 truncate mb-4">ID: {cat._id}</p>

                          <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => setEditingCategory(cat)}
                                className="py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-600 border border-slate-300 hover:border-blue-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Update
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-300 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
                {categories.length === 0 && <p className="text-slate-400 text-sm py-4">No categories created yet.</p>}
              </section>
            </div>
        )}

        {/* ===================== MODAL: UPDATE ITEM ===================== */}
        {editingItem && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Update Item</h3>
                <form onSubmit={handleUpdateItem} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name</label>
                    <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit</label>
                      <input
                          type="text"
                          value={editingItem.unit}
                          onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price</label>
                      <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL</label>
                    <input
                        type="text"
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                    <select
                        value={editingItem.categoryId}
                        onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                        type="submit"
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditingItem(null)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* =================== MODAL: UPDATE CATEGORY =================== */}
        {editingCategory && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Update Category</h3>
                <form onSubmit={handleUpdateCategory} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category Name</label>
                    <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Image URL</label>
                    <input
                        type="text"
                        value={editingCategory.image || ''}
                        onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                        type="submit"
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}