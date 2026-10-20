import Item from '../models/Item.js';
import Category from '../models/Category.js';

export const createItem = async (req, res) => {
    try {
        const { name, unit, price, image, categoryId } = req.body;
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ error: 'Associated category does not exist' });
        }
        const item = await Item.create({ name, unit, price, image, categoryId });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getItems = async (req, res) => {
    try {
        const { name, categoryId } = req.query;
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (categoryId) filter.categoryId = categoryId;

        const items = await Item.find(filter).populate('categoryId', 'name');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('categoryId', 'name');
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ error: 'Invalid Item ID' });
    }
};

export const updateItem = async (req, res) => {
    try {
        if (req.body.categoryId) {
            const categoryExists = await Category.findById(req.body.categoryId);
            if (!categoryExists) {
                return res.status(404).json({ error: 'Associated category does not exist' });
            }
        }
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};