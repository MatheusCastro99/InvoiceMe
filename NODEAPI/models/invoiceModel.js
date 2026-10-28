const mongoose = require("mongoose");

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

    finalPrice: {
      type: Number,
      required: [true, "Please enter Final Price"],
    },

    jobDescription: {
      type: String,
      required: false,
    },

    tableData: {
      type: Array,
      required: false,
    },

    taxRate: {
      type: Number,
      required: false,
    },

    subtotal: {
      type: Number,
      required: false,
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
