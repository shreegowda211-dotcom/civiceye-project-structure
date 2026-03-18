import Category from "../model/categorySchema.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch categories", error: err.message });
  }
};

// Add a new category
export const addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !icon) {
      return res.status(400).json({ success: false, message: "Name and icon are required" });
    }
    const category = new Category({ name, icon });
    await category.save();
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to add category", error: err.message });
  }
};

// Edit a category
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;
    const category = await Category.findByIdAndUpdate(id, { name, icon }, { new: true, runValidators: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to edit category", error: err.message });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, message: "Category deleted", data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete category", error: err.message });
  }
};
