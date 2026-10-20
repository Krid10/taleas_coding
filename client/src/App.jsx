import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form states
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState('');

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
      if (search) params.name = search;
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await axios.get(`${API_BASE}/items`, { params });
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        if (!ignore) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      try {
        const params = {};
        if (search) params.name = search;
        if (selectedCategory) params.categoryId = selectedCategory;

        const res = await axios.get(`${API_BASE}/items`, { params });
        if (!ignore) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };

    loadItems();

    return () => {
      ignore = true;
    };
  }, [search, selectedCategory]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await axios.post(`${API_BASE}/categories`, {
        name: catName,
        image: catImage,
      });
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

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_BASE}/items/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    }
  };

  return (
      <div style={{ maxWidth: '960px', margin: '40px auto', fontFamily: 'system-ui, sans-serif', padding: '0 20px' }}>
        <header style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
          <h1 style={{ margin: 0 }}>Marketplace Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            API Docs: <a href="http://localhost:5000/api-docs" target="_blank" rel="noreferrer">http://localhost:5000/api-docs</a>
          </p>
        </header>

        {/* Creation Forms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Category Form */}
          <form onSubmit={handleAddCategory} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ marginTop: 0 }}>Create Category</h3>
            <input
                type="text"
                placeholder="Category Name *"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <input
                type="text"
                placeholder="Image URL (optional)"
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Add Category
            </button>
          </form>

          {/* Item Form */}
          <form onSubmit={handleAddItem} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ marginTop: 0 }}>Create Item</h3>
            <input
                type="text"
                placeholder="Item Name *"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                  type="text"
                  placeholder="Unit (e.g. pcs, kg) *"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
              />
              <input
                  type="number"
                  placeholder="Price *"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <input
                type="text"
                placeholder="Image URL (optional)"
                value={itemImage}
                onChange={(e) => setItemImage(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <select
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '12px', boxSizing: 'border-box' }}
            >
              <option value="">Select Category *</option>
              {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Add Item
            </button>
          </form>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <input
              type="text"
              placeholder="Filter by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Items Grid */}
        <h3>Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
              <div key={item._id} style={{ border: '1px solid #e1e1e1', borderRadius: '8px', padding: '15px', background: '#fff' }}>
                {item.image && (
                    <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                    />
                )}
                <h4 style={{ margin: '0 0 6px 0' }}>{item.name}</h4>
                <span style={{ display: 'inline-block', fontSize: '12px', background: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px', marginBottom: '8px' }}>
              {item.categoryId?.name || 'Uncategorized'}
            </span>
                <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  ${item.price} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#666' }}>/ {item.unit}</span>
                </p>
                <button
                    onClick={() => handleDeleteItem(item._id)}
                    style={{ marginTop: '10px', width: '100%', padding: '6px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
          ))}
        </div>
        {items.length === 0 && <p style={{ color: '#888' }}>No products match your criteria.</p>}
      </div>
  );
}