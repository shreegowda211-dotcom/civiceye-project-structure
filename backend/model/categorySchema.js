import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  icon: {
    type: String,
    required: true,
    // Store icon name or URL
  },
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
