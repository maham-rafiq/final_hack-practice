import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 🌍 Dynamic Base URL setup for live production deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) navigate('/login');
        else {
            setUser(JSON.parse(loggedInUser));
            fetchProducts();
        }
    }, [navigate]);

    // 1. Dynamic Read Endpoint Connection
    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/products/all`);
            setProducts(res.data); // Fixed missing logic mapping
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setTitle(''); setPrice(''); setDescription(''); setImageFile(null);
        setIsEditing(false); setEditProductId(null);
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    };

    const handleEditClick = (product) => {
        setIsEditing(true); setEditProductId(product._id);
        setTitle(product.title); setPrice(product.price);
        setDescription(product.description || '');
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', title); data.append('price', price);
        data.append('description', description);
        if (imageFile) data.append('image', imageFile);

        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                // 2. Dynamic Update Endpoint Connection
                await axios.put(`${API_BASE_URL}/api/products/update/${editProductId}`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                alert('Product Updated Successfully!');
            } else {
                if (!imageFile) return alert("Please select an image!");
                // 3. Dynamic Create Endpoint Connection
                await axios.post(`${API_BASE_URL}/api/products/add`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
                alert('Product Added Successfully!');
            }
            resetForm(); fetchProducts();
        } catch (err) { 
            alert(err.response?.data?.message || err.message || 'Operation failed'); 
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                const token = localStorage.getItem('token');
                // 4. Dynamic Delete Endpoint Connection
                await axios.delete(`${API_BASE_URL}/api/products/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchProducts();
            } catch (err) { alert('Delete failed'); }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
                    <p className="text-sm text-gray-500">Role: <span className="font-bold text-blue-600 capitalize">{user?.role}</span></p>
                </div>
                <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600">Logout</button>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {user?.role === 'admin' ? (
                    <div className="bg-white p-6 rounded shadow h-fit border-t-4 border-blue-600">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "✏️ Edit Product" : "🚀 Post Product"}</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium">Title</label><input type="text" value={title} required className="mt-1 w-full p-2 border rounded outline-none" onChange={(e) => setTitle(e.target.value)} /></div>
                            <div><label className="block text-sm font-medium">Price ($)</label><input type="number" value={price} required className="mt-1 w-full p-2 border rounded outline-none" onChange={(e) => setPrice(e.target.value)} /></div>
                            <div><label className="block text-sm font-medium">Description</label><textarea value={description} className="mt-1 w-full p-2 border rounded outline-none" rows="2" onChange={(e) => setDescription(e.target.value)}></textarea></div>
                            <div><label className="block text-sm font-medium">Image</label><input id="fileInput" type="file" accept="image/*" required={!isEditing} className="mt-1 w-full text-sm text-gray-500" onChange={(e) => setImageFile(e.target.files[0])} /></div>
                            <div className="flex gap-2">
                                <button type="submit" className={`w-full text-white p-2 rounded font-semibold ${isEditing ? 'bg-green-600' : 'bg-blue-600'}`}>{isEditing ? "Update" : "Upload"}</button>
                                {isEditing && <button type="button" onClick={resetForm} className="bg-gray-300 px-4 rounded font-semibold">Cancel</button>}
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-blue-50 p-6 rounded border border-blue-200 h-fit text-center"><p className="text-blue-800 font-medium">✨ Standard View Mode Active</p></div>
                )}

                <div className="md:col-span-2 bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Items Catalog ({products.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.map((item) => (
                            <div key={item._id} className="border p-4 rounded flex flex-col justify-between bg-gray-50 shadow-sm">
                                <div>
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover rounded mb-3 bg-gray-200" />
                                    <h3 className="font-bold text-lg">{item.title}</h3>
                                    <p className="text-blue-600 font-semibold">${item.price}</p>
                                    <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                </div>
                                {user?.role === 'admin' && (
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={() => handleEditClick(item)} className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-semibold hover:bg-blue-200">Edit</button>
                                        <button onClick={() => handleDelete(item._id)} className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-semibold hover:bg-red-200">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
