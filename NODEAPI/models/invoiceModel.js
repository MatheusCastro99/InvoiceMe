const mongoose = require("mongoose");

// Money is stored as integer cents (ADR-012). Rows from before v1.26 keep finalPrice, subtotal and tableData
// (dollars) as raw fields until #141 converts them; they are not part of this schema.
const isCents = {
  validator: Number.isSafeInteger,
  message: "{PATH} must be a whole number of cents",
};

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPriceCents: { type: Number, required: true, min: 0, validate: isCents },
    lineTotalCents: { type: Number, required: true, min: 0, validate: isCents },
  },
  { _id: false }
);

const invoiceSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Please enter Customer Name"],
    },

    phoneNumber: {
      type: String,
      required: [true, "please enter the phone number"],
    },

    companyEmail: {
      type: String,
      required: false,
    },

    streetAddress: {
      type: String,
      required: false,
    },

    cityAddress: {
      type: String,
      required: false,
    },

    stateAddress: {
      type: String,
      required: false,
    },

    zipAddress: {
      type: String,
      required: false,
    },

    dateOfService: {
      type: Date,
      required: [true, "Please enter Date"],
    },

    invoiceNumber: {
      type: String,
      required: [true, "Please enter Invoice Number"],
      trim: true,
    },

    jobDescription: {
      type: String,
      required: false,
    },

    lineItems: {
      type: [lineItemSchema],
      default: [],
    },

    // The tax rate used, as a percentage (7.25); the server sets it from the state
    taxRate: {
      type: Number,
      required: [true, "Please enter Tax Rate"],
    },

    subtotalCents: {
      type: Number,
      required: [true, "Please enter Subtotal"],
      min: 0,
      validate: isCents,
    },

    taxCents: {
      type: Number,
      required: [true, "Please enter Tax"],
      min: 0,
      validate: isCents,
    },

    finalPriceCents: {
      type: Number,
      required: [true, "Please enter Final Price"],
      min: 0,
      validate: isCents,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // dateOfService is stored at UTC midnight and answered as YYYY-MM-DD.
      // A value that is not a valid Date (an old row) is left as it is: toISOString() would throw.
      transform: (doc, ret) => {
        const date = ret.dateOfService;
        if (date instanceof Date && !Number.isNaN(date.getTime())) {
          ret.dateOfService = date.toISOString().slice(0, 10);
        }
        return ret;
      },
    },
  }
);

// Unique invoice numbers. The index is partial so old rows without a number don't collide with each other.
// server.js builds it before the API takes requests (InvoiceModel.init()).
invoiceSchema.index(
  { invoiceNumber: 1 },
  { unique: true, partialFilterExpression: { invoiceNumber: { $type: "string" } } }
);

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

module.exports = InvoiceModel;
