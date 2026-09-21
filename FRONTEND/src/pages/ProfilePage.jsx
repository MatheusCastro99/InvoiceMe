import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import TableInvoice from "../components/TableInvoice";
import CustomerProfile from "../components/CustomerProfile";
import Divider from '@mui/material/Divider'
import API_ENDPOINTS from "../config/apiConfig";

const ProfilePage = () => {
    let { id } = useParams();

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
            const response = await axios.get(API_ENDPOINTS.INVOICES.LIST);
            //console.log(response.data);
            setInvoices(response.data.data || response.data);
          } catch (error) {
            toast.error(error.message);
          }
    }

    const getCustomer = async () => {
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
        } catch (error) {
        toast.error(error.message);
        }
    };

    useEffect(() => {
        getCustomer();
        getInvoices();
      // Load once on mount; the fetch helpers are recreated every render.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);


    return(
        <div className="max-w-3xl bg-white shadow-lg mx-auto p-5 rounded-sm mt-6">
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