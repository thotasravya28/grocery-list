import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    quantity: String,
    type: String,
    isBought: Boolean,
  },
  { timestamps: true }
);

export default mongoose.models.Item ||
  mongoose.model("Item", ItemSchema);