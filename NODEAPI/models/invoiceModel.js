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
      type: String,
      required: [true, "Please enter Date"],
    },

    invoiceNumber: {
      type: String,
      required: false,
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
  }
);

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

module.exports = InvoiceModel;
