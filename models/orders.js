const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  branch_id: { type: String, required: true },
  branch_name: { type: String, required: true },
  company_id: { type: String, required: true },
  company_name: { type: String, required: true },
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  ordered_date: { type: Date, required: true },
  delivery_date: { type: Date },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  installation_type: { 
    type: String, 
    enum: ['Free', 'Paid', 'None'], 
    default: 'None' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);