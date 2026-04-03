import React from "react";
import axios from "axios";
import Collapsible from 'react-collapsible';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CustomerProfile = ({ customer }) => {
    const navigate = useNavigate()

    const deleteCustomer = async (id) => {
        const result = await Swal.fire({
        title: "This will delete the customer permanently",
        showCancelButton: true,
        confirmButtonText: "Delete",
        })
    
        if (result.isConfirmed) {
            try {
              await axios.delete(`http://localhost:3000/api/customer/${id}`);
              toast.success(`Deleted ${customer.companyName} Successfully`);
              navigate("/")
            } catch (error) {
              toast.error(error.message);
            }
        }
    };

    return (
        <div> 
            <div className="inline-flex">
                <div className="w-1/2 inline-block">
                    {customer.image && (
                    <div className="rounded p-2 mt-2 ">
                        <img className="w-full" src={customer.image} />
                    </div>
                    )}
                </div>
                <div className="w-1/2 ml-4 inline-block">
                    <div>
                        <div>
                            <label className="mb-2 mt-4 block font-semibold">
                                Company Name
                            </label>
                            <input
                                readOnly={true} 
                                type="text"
                                value={customer.companyName || ''}
                                className="text-lg mb-2 block text-center"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Phone Number
                            </label>
                            <input
                                readOnly={true}
                                type="text"
                                value={customer.phoneNumber || ''}
                                className="text-lg mb-2 block text-center"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Contact Name
                            </label>
                            <input
                                readOnly={true}
                                type="text"
                                value={customer.contactName || ''}
                                className="text-lg mb-2 block text-center"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Email
                            </label>
                            <input
                                readOnly={true}
                                type="text"
                                value={customer.companyEmail || ''}
                                className="text-lg mb-2 block text-center w-full"
                            />
                        </div>
                        <div>
                            <Collapsible className="mb-2 block font-semibold" trigger={"Address ⤵"}>
                                <div>
                                    <label className="mb-2 mt-2 block font-semibold">
                                        Street
                                    </label>
                                    <input
                                        readOnly={true}
                                        type="text"
                                        value={customer.streetAddress || ''}
                                        className="text-lg mb-2 block text-center"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-semibold">
                                        City
                                    </label>
                                    <input
                                        readOnly={true}
                                        type="text"
                                        value={customer.cityAddress || ''}
                                        className="text-lg mb-2 block text-center"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-semibold">
                                        State
                                    </label>
                                    <input
                                        readOnly={true}
                                        type="text"
                                        value={customer.stateAddress || ''}
                                        className="text-lg mb-2 block text-center"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block font-semibold">
                                        Zip Code
                                    </label>
                                    <input
                                        readOnly={true}
                                        type="text"
                                        value={customer.zipAddress || ''}
                                        className="text-lg mb-2 block text-center"
                                    />
                                </div>
                            </Collapsible>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-2 flex justify-around gap-4">
                <Link
                    to={`/edit/${customer._id}`}
                    className="inline-block w-40 text-center shadow-md text-sm bg-gray-700 text-white rounded-lg px-4 py-1 font-bold hover:bg-gray-600 hover:cursor-pointer"
                    >
                    Edit
                </Link>
                <button
                    onClick={() => deleteCustomer(customer._id)}
                    className="inline-block w-40 text-center shadow-md text-sm bg-red-700 text-white rounded-lg px-4 py-1 font-bold hover:bg-red-600 hover:cursor-pointer"
                    >
                    Delete Customer
                </button>
            </div>
        </div>
    )
}
export default CustomerProfile;