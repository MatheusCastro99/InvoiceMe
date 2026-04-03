import React, {useState, useEffect}from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import TableInvoice from "../components/TableInvoice";
import CustomerProfile from "../components/CustomerProfile";
import Divider from '@mui/material/Divider'

const ProfilePage = () => {
    let { id } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const [customer, setCustomer] = useState({
        companyName: "",
        phoneNumber: "",
        contactName: "",
        companyEmail: "",
        image: "",
        streetAddress: "",
        cityAddress: "",
        stateAddress: "",
        zipAddress: "",
    });
    const [invoices, setInvoices] = useState([]);

    const getInvoices = async() => {
        try {
            setIsLoading(true);
            const response = await axios.get("http://localhost:3000/api/generateInvoice");
            //console.log(response.data);
            setInvoices(response.data);
            setIsLoading(false);
          } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
          }
    }

    const getCustomer = async () => {
        setIsLoading(true);
        try {
        const response = await axios.get(`http://localhost:3000/api/customer/${id}`);
        setCustomer({
            companyName: response.data.companyName,
            phoneNumber: response.data.phoneNumber,
            contactName: response.data.contactName,
            companyEmail: response.data.companyEmail,
            image: response.data.image,
            streetAddress: response.data.streetAddress,
            cityAddress: response.data.cityAddress,
            stateAddress: response.data.stateAddress,
            zipAddress: response.data.zipAddress,
            _id: response.data._id
        });
        setIsLoading(false);
        } catch (error) {
        setIsLoading(false);
        toast.error(error.message);
        }
    };

    useEffect(() => {
        getCustomer();
        getInvoices();
      }, []);


    return(
        <div className="max-w-2xl bg-white shadow-lg mx-auto p-5 rounded mt-6">
            <div>
                <CustomerProfile customer={customer}/>
            </div>
            <Divider className="mb-3">Invoices </Divider>
            <div>
                <TableInvoice
                    invoices={invoices}
                    getInvoices={getInvoices}
                    customers={customer}
                />
            </div>
        </div>
    )   
}

export default ProfilePage;