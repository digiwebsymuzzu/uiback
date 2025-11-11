import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
    returnStatus: {
      type: String,
      enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed'],
      default: 'None',
    },
  },
  { _id: false },
)

const userDetailsSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    businessName: String,
    country: String,
    address: String,
    apartment: String,
    city: String,
    state: String,
    postCode: String,
    phone: String,
    email: String,
    notes: String,
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    user: userDetailsSchema, // Embedded customer data snapshot

    cartItems: [cartItemSchema],

    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: ['cash payment', 'online', 'COD', 'card'],
      default: 'cash payment',
    },

    // ✅ Added based on UI (Status in Orders.jsx)
    status: {
      type: String,
      enum: ['Payment Pending', 'Processing', 'On Hold', 'Completed', 'Cancelled', 'Refund'],
      default: 'Payment Pending',
    },

    // ✅ NEW fields mapped from UI (billing & shipping)
    billingAddress: { type: String },
    shippingAddress: { type: String },

    // ✅ Admin notes or user notes
    adminNotes: { type: String },

    // ✅ Optional Invoice Number / Prefix if needed
    invoiceNumber: { type: String },

    // ✅ To track reply comments later (if needed like review reply)
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model('Order', orderSchema)
