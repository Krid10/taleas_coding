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

  // Form states
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('');

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // Fetch Items
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
    const loadInit = async () => {
      try {
        const catRes = await axios.get(`${API_BASE}/categories`);
        if (!ignore) setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadInit();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadItems = async () => {
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
    loadItems();
    return () => {
      ignore = true;
    };
  }, [searchName, selectedCategory]);

  // Handlers
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

  // GET Item by ID
  const handleFindById = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIdSearchError('');
    setSingleItemResult(null);

    try {
      const res = await axios.get(`${API_BASE}/items/${searchId.trim()}`);
      setSingleItemResult(res.data);
    } catch (err) {
      setIdSearchError('Item not found with this ID');
      console.error(err);
    }
  };

  const handleClearIdSearch = () => {
    setSearchId('');
    setSingleItemResult(null);
    setIdSearchError('');
  };

  // DELETE Item command
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API_BASE}/items/${id}`);
      if (singleItemResult && singleItemResult._id === id) {
        setSingleItemResult(null);
      }
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    }
  };

  return (
      <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
        {/* Header */}
        <header style={{ marginBottom: '24px', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111827' }}>Marketplace Dashboard</h1>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
            API Docs: <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>http://localhost:5000/api-docs</a>
          </p>
        </header>

        {/* Forms Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Create Category */}
          <form onSubmit={handleAddCategory} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Create Category</h3>
            <input
                type="text"
                placeholder="Category Name *"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <input
                type="text"
                placeholder="Image URL (optional)"
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500' }}>
              Add Category
            </button>
          </form>

          {/* Create Item */}
          <form onSubmit={handleAddItem} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Create Item</h3>
            <input
                type="text"
                placeholder="Item Name *"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                  type="text"
                  placeholder="Unit (e.g. pcs, kg) *"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
              <input
                  type="number"
                  placeholder="Price *"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
            <input
                type="text"
                placeholder="Image URL (optional)"
                value={itemImage}
                onChange={(e) => setItemImage(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', marginBottom: '12px', boxSizing: 'border-box', border: '1px solid #d1d5db', borderRadius: '4px' }}
            >
              <option value="">Select Category *</option>
              {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500' }}>
              Add Item
            </button>
          </form>
        </div>

        {/* Navigation Tab Bar (Items Bar vs Categories Bar) */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
          <button
              type="button"
              onClick={() => setActiveTab('items')}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                borderBottom: activeTab === 'items' ? '3px solid #2563eb' : '3px solid transparent',
                background: 'none',
                fontSize: '16px',
                fontWeight: activeTab === 'items' ? 'bold' : 'normal',
                color: activeTab === 'items' ? '#2563eb' : '#6b7280',
              }}
          >
            Items Bar ({items.length})
          </button>
          <button
              type="button"
              onClick={() => setActiveTab('categories')}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                borderBottom: activeTab === 'categories' ? '3px solid #2563eb' : '3px solid transparent',
                background: 'none',
                fontSize: '16px',
                fontWeight: activeTab === 'categories' ? 'bold' : 'normal',
                color: activeTab === 'categories' ? '#2563eb' : '#6b7280',
              }}
          >
            Categories Bar ({categories.length})
          </button>
        </div>

        {/* Tab 1: ITEMS VIEW */}
        {activeTab === 'items' && (
            <div>
              {/* Search by ID Section (GET /items/:id) */}
              <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>Lookup Item by ID (GET /api/items/:id)</h4>
                <form onSubmit={handleFindById} style={{ display: 'flex', gap: '10px' }}>
                  <input
                      type="text"
                      placeholder="Enter exact MongoDB _id..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                  <button type="submit" style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Fetch by ID
                  </button>
                  {singleItemResult && (
                      <button type="button" onClick={handleClearIdSearch} style={{ padding: '8px 12px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Clear
                      </button>
                  )}
                </form>
                {idSearchError && <p style={{ color: '#dc2626', margin: '8px 0 0 0', fontSize: '13px' }}>{idSearchError}</p>}

                {/* Single Item ID Result Card */}
                {singleItemResult && (
                    <div style={{ marginTop: '14px', padding: '12px', background: '#fff', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 'bold' }}>✓ Found Item Result:</span>
                      <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{singleItemResult.name} — ${singleItemResult.price} / {singleItemResult.unit}</p>
                      <p style={{ margin: '2px 0', fontSize: '12px', color: '#6b7280' }}>ID: {singleItemResult._id} | Category: {singleItemResult.categoryId?.name || singleItemResult.categoryId}</p>
                      <button
                          type="button"
                          onClick={() => handleDeleteItem(singleItemResult._id)}
                          style={{ marginTop: '8px', padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Delete Item Command
                      </button>
                    </div>
                )}
              </div>

              {/* Filter Bar (Search by name & category dropdown) */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>
                <input
                    type="text"
                    placeholder="Search / Filter items by name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    style={{ flex: 2, padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Items Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {items.map((item) => (
                    <div key={item._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                      {item.image && (
                          <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                          />
                      )}
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{item.name}</h4>
                      <span style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontFamily: 'monospace' }}>
                  ID: {item._id}
                </span>
                      <span style={{ display: 'inline-block', fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', width: 'fit-content', marginBottom: '8px' }}>
                  {item.categoryId?.name || 'Uncategorized'}
                </span>
                      <p style={{ margin: '4px 0 12px 0', fontSize: '17px', fontWeight: 'bold' }}>
                        ${item.price} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#6b7280' }}>/ {item.unit}</span>
                      </p>
                      {/* Delete Item Command Button */}
                      <button
                          type="button"
                          onClick={() => handleDeleteItem(item._id)}
                          style={{ marginTop: 'auto', padding: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        Delete Item
                      </button>
                    </div>
                ))}
              </div>
              {items.length === 0 && <p style={{ color: '#9ca3af', marginTop: '10px' }}>No items found.</p>}
            </div>
        )}

        {/* Tab 2: CATEGORIES VIEW */}
        {activeTab === 'categories' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0' }}>All Categories List</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {categories.map((cat) => (
                    <div key={cat._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', background: '#fff' }}>
                      {cat.image && (
                          <img
                              src={cat.image}
                              alt={cat.name}
                              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                          />
                      )}
                      <h4 style={{ margin: '0 0 4px 0' }}>{cat.name}</h4>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {cat._id}</p>
                    </div>
                ))}
              </div>
              {categories.length === 0 && <p style={{ color: '#9ca3af' }}>No categories created yet.</p>}
            </div>
        )}
      </div>
  );
}