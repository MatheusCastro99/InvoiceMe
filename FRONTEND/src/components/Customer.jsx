/* eslint-disable react/prop-types */
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const Customer = ({ customer, getCustomers }) => {
  const deleteCustomer = async (id) => {
    const result = await Swal.fire({
      title: "Do you want to delete this Customer?",
      text: "You will not be able to revert this change.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor:"#aaa",
      confirmButtonText: "Delete",
      confirmButtonColor:"#3085d6"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/customer/${id}`);
        toast.success("Delete a Customer Successfully");
        getCustomers();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-white rounded shadow-lg overflow-auto">
      <Link to={`/profilePage/${customer._id}`}><img src={customer.image} className="w-full h-28 object-contain" /></Link>
      <div className="px-4 pt-2 pb-4">
        <h2 className="text font-semibold">{customer.companyName}</h2>
        <div className="text-sm">Phone Number: {customer.phoneNumber}</div>
        <div className="text-sm">Contact Name: {customer.contactName}</div>
        <div className="text-xs">Email: {customer.companyEmail}</div>

        <div className="mt-2 flex gap-4">
          <Link
            to={`/edit/${customer._id}`}
            className="inline-block w-full text-center shadow-md text-sm bg-gray-700 text-white rounded-sm px-4 py-1 font-bold hover:bg-gray-600 hover:cursor-pointer"
          >
            Edit
          </Link>
          <button
            onClick={() => deleteCustomer(customer._id)}
            className="inline-block w-full text-center shadow-md text-sm bg-red-700 text-white rounded-sm px-4 py-1 font-bold hover:bg-red-600 hover:cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customer;
