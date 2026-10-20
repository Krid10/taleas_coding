import Category from '../models/Category.js';
import Item from '../models/Item.js';

export const createCategory = async (req, res) => {
    try {
        const { name, image } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const category = await Category.create({ name, image });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: 'Invalid Category ID' });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        await Item.deleteMany({ categoryId: req.params.id });
        res.json({ message: 'Category and associated items deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};