import mongoose from 'mongoose';

const attributeValueSchema = new mongoose.Schema({
  attributeValue: { type: String, required: true },
  attributeSku: { type: String },
  attributeRegularPriceInr: { type: Number },
  attributeSalePriceInr: { type: Number },
  attributeRegularPriceUsd: { type: Number },
  attributeSalePriceUsd: { type: Number },
  attributeStockStatus: {            // Only this is needed
    type: Number,
    enum: [0, 1],                   // 0 = Out of Stock, 1 = In Stock
    default: 1
  },
  attributeImage: { type: String }
});

const productAttributeSchema = new mongoose.Schema({
  attributeName: { type: String, required: true },
  attributeValues: [attributeValueSchema]
});

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productSlug: { type: String, unique: true, trim: true },
  productSku: { type: String },
  productShortDescription: { type: String },
  productLongDescription: { type: String },
  productCategories: [{ _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, name: { type: String }}],
  productBrands: [ { _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, name: { type: String } }],
  productTags: [{ type: String }],

//   productTags: [
//   {
//     _id: { type: String, required: true },
//     name: { type: String, required: true }
//   }
// ],

  productAttributes: [productAttributeSchema],
  productMainImage: { type: String },
  productImages: [{ type: String }],
  productRegularPriceInr: { type: Number },
  productSalePriceInr: { type: Number },
  productRegularPriceUsd: { type: Number },
  productSalePriceUsd: { type: Number },
  productStock: {               // Only this is needed
    type: Number,
    enum: [0, 1],                     // 0 = Out of Stock, 1 = In Stock
    default: 1
  },
  productWeight: { type: Number },
  productDimensions: { type: Object },

  oldProductID: { type: String },                  // new field from CSV ID
  relatedProducts: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);