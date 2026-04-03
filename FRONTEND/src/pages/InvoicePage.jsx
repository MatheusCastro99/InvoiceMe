import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {Select} from "flowbite-react"
import Divider from '@mui/material/Divider'
import { Chip, Switch, FormControlLabel } from "@mui/material";
import Collapsible from 'react-collapsible';
import CustomerInfo from "../components/CustomerInfo";
import TableDescription from "../components/TableDescription";

const InvoicePage = () => {
    const [jobPrice, setJobPrice] = useState(Number)
    const [jobDescription, setJobDescription] = useState();
    const [customers, setCustomers] = useState([]);
    const [tempCustomer, setTempCustomer] = useState([]);
    const [correspondingTax, setCorrespondingTax] = useState();
    const [finalPrice, setFinalPrice] = useState(0.00);
    const [dateOfService, setDateOfService] = useState('');
    const [invoiceNumber, setInvoiceNumber]= useState();
    const [dateValidity, setDateValidity] = useState(false);
    const [invoiceNumValidity, setInvoiceNumValidity] = useState(false);
    const [invoicesArr, setInvoicesArr] = useState([]);
    const [openTable, setOpenTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const invoiceNumField = document.getElementById("invoiceNum");
    const pdfButtonField = document.getElementById("pdfButton");
    const dateField = document.getElementById('dateField');

    const requestInfo = async (e) => {
        try {
            if(e.target.value == "Select Company") {
              setTempCustomer([]);
              setCorrespondingTax();
              return;
            }
            const info = await axios.get(`http://localhost:3000/api/customer/${e.target.value}`);
            console.log(info)
            setTempCustomer(info.data);
            handleTax(info.data.stateAddress);
            console.log(info.data.stateAddress);
            <CustomerInfo
              customer = {tempCustomer}/>;
        } catch (error) {
            setTempCustomer([])
        }    
    }

    const getInvoices = async() => {
      try {
          const response = await axios.get("http://localhost:3000/api/generateInvoice");
          //console.log(response.data);
          setInvoicesArr(response.data);
        } catch (error) {
          toast.error(error.message);
        }
  }

    const handleJobPrice = async(e) => {
      let tempSubtotal;
      
      if(e.target === undefined) {
        tempSubtotal = e;
      }
      else{
        tempSubtotal = e.target.value
      }

      setJobPrice(tempSubtotal)
      const getFinalPrice = await axios.put(`http://localhost:3000/api/taxinfo/getTaxAmount`, 
        {jobPrice:tempSubtotal, taxRate: correspondingTax, jobDescription: jobDescription})
      setFinalPrice(getFinalPrice.data)
    }

    const handleTax = async(state) => {
      const getTaxRate = await axios.put(`http://localhost:3000/api/taxinfo/getTaxRate`, {state:state});
      setCorrespondingTax(getTaxRate.data);
    }

    const validateDate = (date) => {
      const valDate = '^\\d{2}/?\\d{2}/?\\d{4}$'
      if (!date.match(valDate)) {
        toast.error(
          <div>
              <p>Please input date in the following format:</p> <br/>
              <p>MMDDYYYY</p>
          </div>
      )

      dateField.classList.add('border', 'border-red-500')
      pdfButtonField.classList.add('hover:cursor-not-allowed');
      setDateValidity(false)
      }

      else {
        dateField.classList.remove('border', 'border-red-500');
        pdfButtonField.classList.remove('hover:cursor-not-allowed');
        let chars = [...date]
        if(chars.length<10){
          chars.splice(2, 0, "/")
          chars.splice(5, 0, "/")
        }
        setDateOfService(chars.join(''))
        setDateValidity(true)
      }
    }

    const validateInvoiceNum = (invoiceNum) => {
      const lastInvoice = invoicesArr[((invoicesArr.length)-1)];

      if (invoiceNum <= lastInvoice.invoiceNumber) {
        toast.error(
          <div>
              <p>Error: Invoice Number is not unique</p> <br/>
              <p>last invoice number is #{lastInvoice.invoiceNumber}</p>
          </div>
        )
        invoiceNumField.classList.remove('border-green-500');
        invoiceNumField.classList.add('border', 'border-red-500');
        pdfButtonField.classList.add('hover:cursor-not-allowed');
        setInvoiceNumValidity(false);
      }
      else if (invoiceNum >= (parseInt(lastInvoice.invoiceNumber)+2)) {
        toast.error(
          <div>
              <p>Attention: Invoice Number skipped one or more numbers</p> <br/>
              <p>last invoice number is #{lastInvoice.invoiceNumber}</p> <br/>
              <p>If you wish to proceed, ignore this warning</p>
          </div>
        )
        setInvoiceNumValidity(true);
      }
      else {
        invoiceNumField.classList.remove('border-red-500');
        invoiceNumField.classList.add('border', 'border-green-500');
        pdfButtonField.classList.remove('hover:cursor-not-allowed');
        setInvoiceNumValidity(true);
      }
    }

    const checkValidity = (e) => {
      if(!(dateValidity&&invoiceNumValidity) || jobPrice == 0) {
        e.preventDefault();
        toast.error(
          <div>
              <p>Check Date, Invoice Number, and Subtotal</p> <br/>
          </div>
        )
      }
    }
    const handleChildData = (descriptionData) => {
      setTableData(descriptionData);

      let updatedSubtotal = 0;
      descriptionData.map((item, i) => {
        updatedSubtotal += descriptionData[i]['itemTotal'];
      })

      setJobPrice(updatedSubtotal);
      handleJobPrice(updatedSubtotal);
      //console.log(tableData);
    }

    const handleJobInfo = () => {
      //console.log("test")
      openTable?setOpenTable(false):setOpenTable(true);
    }

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/customer");
            setCustomers(response.data)
        } catch (error) {
            
        }}

    useEffect( () => {fetchData(), getInvoices()},[]);
        return (
            <div className="max-w-xl bg-white shadow-lg mx-auto p-7 rounded mt-6">
                <h2 id="home" className="font-semibold text-2xl mb-4 block text-center">
                    Generate Invoice
                </h2>
                <div className="w-full px-4">
                    <div className="mt-3">
                        <Select onChange = {(e)=>(requestInfo(e))} id="customers" required>
                            <option>Select Company</option>
                            {customers?.map((customers, index) => {
                                return(
                                    <option value={customers._id} key={index}> {customers.companyName} </option>
                                )
                            })}
                        </Select>
                    </div>
                      <div className="mt-3">
                          <div>
                            <CustomerInfo
                              customer = {tempCustomer}/>
                          </div>
                          <div className="flex justify-center px-10 mt-5">
                            <Link
                              to={`/edit/${tempCustomer._id}`}
                              className="inline-block w-1/2 text-center shadow-md text-sm bg-blue-500 text-white rounded-lg px-4 py-1 font-bold transition ease-in-out duration-300 hover:scale-110 hover:bg-blue-600 hover:cursor-pointer">
                              Update
                            </Link>
                          </div>
                      </div>
                </div>
                <div className="mt-7 mb-3 px-3">
                  <Collapsible trigger={<Divider variant="middle" className="bg-color-red"><Chip label="Job Information ⤵" size="small" /></Divider>} open={true}>
                    <div className="rows mt-2">
                    <div className="ml-3 font-semibold"><FormControlLabel control={<Switch onChange={handleJobInfo}/>}/>Table Form</div>
                        <label className="mb-2 block font-semibold row">
                          Date of Service:
                        </label>
                        <input
                          type="text"
                          id="dateField"
                          value={dateOfService || ''}
                          onChange={(e) => setDateOfService(e.target.value)}
                          onBlur={(e) => {validateDate(e.target.value)}}
                          className="w-1/2 font-semibold text-lg mb-2 ml-4 block row"
                          placeholder="Date of Service: mmddyyyy"
                        />
                        <label className="mb-2 block font-semibold row">
                          Invoice Number:
                        </label>
                        <input
                          type="text"
                          id="invoiceNum"
                          value={invoiceNumber || ''}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          onBlur={(e) => validateInvoiceNum(e.target.value)}
                          className="w-1/2 font-semibold text-lg mb-2 ml-4 block row"
                          placeholder="Enter Invoice Number"
                        />
                      </div>
                      <div><Collapsible open={openTable}>
                        <div>
                          <TableDescription 
                            dataCallBack = {handleChildData} />
                        </div>
                      </Collapsible></div>
                      <div><Collapsible open={!openTable}>
                        <label className="mb-2 block font-semibold">
                          Job Description
                        </label>
                        <textarea
                          type="text"
                          value={jobDescription || ''}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="w-full font-semibold text-lg mb-2 block text-center"
                          placeholder="Enter Job Description"
                        />
                      </Collapsible></div>
                    <div>
                        <label className="mb-2 mt-2 block font-semibold">
                          Subtotal
                        </label>
                        <input
                          readOnly={openTable}
                          type="text"
                          value={ (jobPrice===0.00?'':jobPrice)}
                          onChange={handleJobPrice}
                          className="w-full font-semibold text-lg mb-2 block text-right"
                          placeholder="Enter Job Subtotal"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block font-semibold">
                          Taxes
                        </label>
                        <div style ={{display:"flex", justifyContent: "space-evenly"}}>
                        <label 
                          readOnly = {true}
                          type="text"
                          className="inline-block font-semibold mb-2 block text-center"
                          placeholder="State Taxes">
                            {tempCustomer.stateAddress||"Select a State for this company"}
                        </label>
                        <label 
                          readOnly = {true}
                          type="text"
                          className="inline-block font-semibold mb-2 block text-center"
                          placeholder="State Taxes">
                            {correspondingTax||0}%
                        </label>
                        <label 
                          readOnly = {true}
                          type="text"
                          className="inline-block font-semibold mb-2 block text-center"
                          placeholder="State Taxes">
                            {"$"+(parseFloat((jobPrice*(correspondingTax/100)).toFixed(2))||0)}
                          </label>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block font-semibold">
                          Total
                        </label>
                        <input
                          readOnly = {true}
                          type="text"
                          className="w-full font-semibold text-lg mb-2 block text-center"
                          placeholder="Total Price"
                          value={"$"+[parseFloat(finalPrice).toFixed(2) || 0]}
                        />
                    </div>
                  </Collapsible>
                </div>
                <div className="w-full flex justify-center">
                    <Link
                      id="pdfButton"
                      to = {`/pdfPage`}
                      onClick={checkValidity}
                      state= {{customerInfo: tempCustomer, subtotal: jobPrice, taxRate: correspondingTax, jobDescription: jobDescription, finalPrice: finalPrice, dateOfService: dateOfService, invoiceNumber: invoiceNumber, tableData: tableData}}
                      className="inline-block w-1/2 text-center shadow-md text-sm bg-blue-500 text-white rounded-lg px-4 py-1 font-bold transition ease-in-out duration-300 hover:scale-110 hover:bg-blue-600 hover:cursor-pointer">
                      Generate PDF
                  </Link>
                </div>      
            </div>
        );
}

export default InvoicePage;