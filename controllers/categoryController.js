import Category from '../models/Category.js';
import Post from '../models/Post.js';

//POST
export const createCategory = async (req, res) => {
    const { title, description } = req.body;
    try {
        const newCategory = new Category({ title, description });
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//GET
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategoriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//PUT
export const updateCategory = async (req, res) => {
    const { id } = req.params; 
    try { // Actualizamos la categoria
        const categoryUpdated = await Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!categoryUpdated) return res.status(404).json({ message: "Category not found" });
        res.json(categoryUpdated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//DELETE
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Borramos los posts primero (efecto cascada)
        await Post.deleteMany({ category: id });

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};