import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Customer from "../components/Customer";
import Divider from '@mui/material/Divider';
import Collapsible from 'react-collapsible';
import TableInvoice from "../components/TableInvoice";

//EVERYWHERE: NON-OPERATIONAL NUMBERS (PHONE NUMBERS, DATES, INVOICE NUMBERS) ARE TO BE TREATED AS STRINGS
//EVERYWHERE: OPERATIONAL NUMBERS (PRICES, TAXES) ARE TO BE TREATED AS INT/FLOATS
//EVERYWHERE: IMPLEMENT VERIFICATIONS/VALIDATIONS/DATA FORMATTING (DATES, PRICES, PHONE NUMBER, EMAILS, ETC) REGEX

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const getCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/api/customer");
      //console.log(response.data)
      setCustomers(response.data);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    getCustomers();
    getInvoices();
  }, []);

  return ( //ADD A SEARCHBAR BY GENERATE INVOICE SIDE
    <div id="home" className="">
      <div className="flex justify-between">
        <div className="inline-block">
        <Link
          to="/create"
          className="inline-block mt-4 shadow-md bg-blue-700 text-white rounded-sm px-4 py-2 font-bold transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer hover:scale-110"
        >
          Create Customer
        </Link>
        <Link
          to="/invoice"
          className="inline-block mt-4 ml-5 shadow-md bg-gray-400 text-white rounded-sm px-4 py-2 font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer hover:scale-110"
        >
          Generate Invoice
        </Link>
        </div>
        <div className="seeTable">
          <a
            href="#companyTable"
            className="inline-flex mt-4 ml-5 mb-4 shadow-md bg-gray-400 text-white rounded px-4 py-2 font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer hover:scale-110">
              See All Invoices
          </a>
        </div>
      </div>
      <Divider 
        sx={{fontSize:20, fontWeight:"bold", color:"white", "&::before, &::after": {borderColor: "gray", borderBottomWidth: 3,},}}>
        Company Cards
      </Divider>
      <div className="companyCard">
        <div className="grid grid-cols-2 lg:grid-cols-4 flex gap-4 mt-5">
          {isLoading ? (
            "Loading"
          ) : (
            <>
              {customers.length > 0 ? (
                <>
                  {customers.map((customer, index) => {
                    return (
                      <Customer
                        key={index}
                        customer={customer}
                        getCustomers={getCustomers}
                      />
                    );
                  })}
                </>
              ) : (
                <div className="mt-4 bg-gray-600 text-white text-center font-serif p-4">
                  There is no customer
                </div>  
              )}
            </>
          )}
        </div>
      </div>
      <div id="companyTable" className="companyTable">
        <Collapsible 
          trigger={
            <Divider 
                sx={{fontSize:20, fontWeight:"bold", color:"white", "&::before, &::after": {borderColor: "gray", borderBottomWidth: 3,},}}>
                All Invoices ⤵
            </Divider>
          }>
          <TableInvoice 
            invoices={invoices} 
            getInvoices={getInvoices}
            customers={customers}
          />
        </Collapsible>
      </div>
    </div>
  );
};

export default HomePage;
