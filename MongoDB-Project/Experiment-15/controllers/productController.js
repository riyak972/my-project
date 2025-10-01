const Product = require("../models/product");

exports.addSampleProducts = async (req, res) => {
  try {
    const products = [
      {
        name: "T-Shirt",
        price: 499,
        category: "Clothing",
        variants: [
          { color: "Red", size: "M", stock: 10 },
          { color: "Blue", size: "L", stock: 5 }
        ]
      },
      {
        name: "Sneakers",
        price: 2999,
        category: "Footwear",
        variants: [
          { color: "Black", size: "9", stock: 20 },
          { color: "White", size: "10", stock: 8 }
        ]
      }
    ];

    await Product.insertMany(products);
    res.json({ message: "Sample products added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.getByCategory = async (req, res) => {
  const category = req.params.category;
  const products = await Product.find({ category });
  res.json(products);
};

exports.getVariants = async (req, res) => {
  const products = await Product.find({}, { name: 1, "variants.color": 1, "variants.stock": 1 });
  res.json(products);
};

exports.updateStock = async (req, res) => {
  try {
    const { name, color, size, stock } = req.body;

    const product = await Product.findOneAndUpdate(
      { name, "variants.color": color, "variants.size": size },
      { $set: { "variants.$.stock": stock } },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Variant not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};