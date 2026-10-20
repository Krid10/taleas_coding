import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price must be non-negative'],
        },
        image: {
            type: String,
            default: '',
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'CategoryId is required'],
        },
    },
    { timestamps: true }
);

export default mongoose.model('Item', itemSchema);