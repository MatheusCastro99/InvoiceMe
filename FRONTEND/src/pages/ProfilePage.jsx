import React, {useState, useEffect}from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import TableInvoice from "../components/TableInvoice";
import CustomerProfile from "../components/CustomerProfile";
import Divider from '@mui/material/Divider'
import API_ENDPOINTS from "../config/apiConfig";

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
            const response = await axios.get(API_ENDPOINTS.INVOICES.LIST);
            //console.log(response.data);
            setInvoices(response.data.data || response.data);
            setIsLoading(false);
          } catch (error) {
            toast.error(error.message);
            setIsLoading(false);
          }
    }

    const getCustomer = async () => {
        setIsLoading(true);
        try {
        const response = await axios.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id));
        const payload = response?.data?.data ?? response?.data ?? {};
        setCustomer({
            companyName: payload.companyName || "",
            phoneNumber: payload.phoneNumber || "",
            contactName: payload.contactName || "",
            companyEmail: payload.companyEmail || "",
            image: payload.image || "",
            streetAddress: payload.streetAddress || "",
            cityAddress: payload.cityAddress || "",
            stateAddress: payload.stateAddress || "",
            zipAddress: payload.zipAddress || "",
            _id: payload._id
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
        <div className="max-w-3xl bg-white shadow-lg mx-auto p-5 rounded mt-6">
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