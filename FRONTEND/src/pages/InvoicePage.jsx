import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {Select} from "flowbite-react"
import Divider from '@mui/material/Divider'
import { Chip, Switch, FormControlLabel } from "@mui/material";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CollapsibleImport from 'react-collapsible';
const Collapsible = CollapsibleImport && (CollapsibleImport.default || CollapsibleImport);
import CustomerInfo from "../components/CustomerInfo";
import TableDescription from "../components/TableDescription";
import API_ENDPOINTS from "../config/apiConfig";
import { isValidDateOfService } from "../utils/date";

const InvoicePage = () => {
    const [jobPrice, setJobPrice] = useState(Number)
    const [jobDescription, setJobDescription] = useState();
    const [customers, setCustomers] = useState([]);
    const [tempCustomer, setTempCustomer] = useState([]);
    const [correspondingTax, setCorrespondingTax] = useState();
    const [finalPrice, setFinalPrice] = useState(0.00);
    const [dateOfService, setDateOfService] = useState('');
    const [invoiceNumber, setInvoiceNumber]= useState();
    const [dateTouched, setDateTouched] = useState(false);
    const [invoiceNumValidity, setInvoiceNumValidity] = useState(false);
    const [invoiceNumChecked, setInvoiceNumChecked] = useState(false);
    const [invoicesArr, setInvoicesArr] = useState([]);
    const [openTable, setOpenTable] = useState(false);
    const [tableData, setTableData] = useState([]);

    const requestInfo = async (e) => {
        try {
            if(e.target.value == "Select Company") {
              setTempCustomer([]);
              setCorrespondingTax();
              return;
            }
            const info = await axios.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(e.target.value));
            const payload = info?.data?.data ?? info?.data ?? {};
            console.log(info)
            setTempCustomer(payload);
            handleTax(payload.stateAddress);
            console.log(payload.stateAddress);
        } catch {
            setTempCustomer([])
        }    
    }

    const getInvoices = async() => {
      try {
          const response = await axios.get(API_ENDPOINTS.INVOICES.LIST);
          //console.log(response.data);
          const payload = response?.data?.data ?? response?.data ?? [];
          setInvoicesArr(payload);
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
      const getFinalPrice = await axios.post(API_ENDPOINTS.TAX.CALCULATE, 
        {jobPrice:tempSubtotal, taxRate: correspondingTax, jobDescription: jobDescription})
      const responsePayload = getFinalPrice?.data?.data ?? getFinalPrice?.data;
      const calculatedFinalPrice = responsePayload?.finalPrice ?? responsePayload;
      setFinalPrice(Number(calculatedFinalPrice) || 0)
    }

    const handleTax = async(state) => {
      const getTaxRate = await axios.post(API_ENDPOINTS.TAX.GET_RATE, {state:state});
      const fetchedRate = getTaxRate?.data?.data ?? getTaxRate?.data;
      const parsedRate = typeof fetchedRate === "object" ? fetchedRate?.taxRate : fetchedRate;
      setCorrespondingTax(Number(parsedRate) || 0);
    }

    // Same rule as the server (ADR-003): blank and an exact match (after trimming) of a stored number are blocked.
    // A gap or a lower number compared with the newest invoice only warns.
    const validateInvoiceNum = (value) => {
      const num = value.trim();
      const newest = invoicesArr[0];
      const newestNum = newest?.invoiceNumber?.trim();
      setInvoiceNumChecked(true);

      if (num === "") {
        toast.error("Invoice number is required");
        setInvoiceNumValidity(false);
        return;
      }

      if (invoicesArr.some((invoice) => invoice.invoiceNumber?.trim() === num)) {
        toast.error(
          <div>
              <p>Error: Invoice Number is not unique</p> <br/>
              <p>last invoice number is #{newestNum}</p>
          </div>
        )
        setInvoiceNumValidity(false);
        return;
      }

      setInvoiceNumValidity(true);

      if (newestNum && /^\d+$/.test(num) && /^\d+$/.test(newestNum)) {
        const expected = BigInt(newestNum) + BigInt(1);
        if (BigInt(num) > expected) {
          toast.error(
            <div>
                <p>Attention: Invoice Number skipped one or more numbers</p> <br/>
                <p>last invoice number is #{newestNum}</p> <br/>
                <p>If you wish to proceed, ignore this warning</p>
            </div>
          )
        }
        else if (BigInt(num) < expected) {
          toast.error(
            <div>
                <p>Attention: Invoice Number is lower than the last invoice number</p> <br/>
                <p>last invoice number is #{newestNum}</p> <br/>
                <p>If you wish to proceed, ignore this warning</p>
            </div>
          )
        }
      }
    }

    const invoiceNumInvalid = invoiceNumChecked && !invoiceNumValidity;

    const dateIsValid = isValidDateOfService(dateOfService);
    const dateHasError = dateTouched && !dateIsValid;

    const checkValidity = (e) => {
      if(!(dateIsValid&&invoiceNumValidity) || jobPrice == 0) {
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
            const response = await axios.get(API_ENDPOINTS.CUSTOMERS.LIST);
            const payload = response?.data?.data ?? response?.data ?? [];
            setCustomers(payload)
        } catch (error) {
            toast.error(error.message);
        }};

    useEffect( () => {fetchData(), getInvoices()},[]);
        return (
            <div className="max-w-xl bg-white shadow-lg mx-auto p-7 rounded-sm mt-6">
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
                        <div className="ml-4 mb-2 w-1/2">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Date of Service"
                              format="MM/DD/YYYY"
                              value={dateOfService ? dayjs(dateOfService) : null}
                              onChange={(v) => setDateOfService(v?.isValid() ? v.format("YYYY-MM-DD") : "")}
                              slotProps={{
                                textField: {
                                  id: "dateField",
                                  size: "small",
                                  fullWidth: true,
                                  error: dateHasError,
                                  helperText: dateHasError ? "Enter a real date as MM/DD/YYYY" : undefined,
                                  onBlur: () => setDateTouched(true),
                                },
                              }}
                            />
                          </LocalizationProvider>
                        </div>
                        <label className="mb-2 block font-semibold row">
                          Invoice Number:
                        </label>
                        <input
                          type="text"
                          id="invoiceNum"
                          value={invoiceNumber || ''}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          onBlur={(e) => validateInvoiceNum(e.target.value)}
                          aria-invalid={invoiceNumInvalid}
                          className={`w-1/2 font-semibold text-lg mb-2 ml-4 block row${invoiceNumChecked ? (invoiceNumValidity ? " border border-green-500" : " border border-red-500") : ""}`}
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
                          className="inline-block font-semibold mb-2 text-center"
                          placeholder="State Taxes">
                            {tempCustomer.stateAddress||"Select a State for this company"}
                        </label>
                        <label 
                          readOnly = {true}
                          type="text"
                          className="inline-block font-semibold mb-2 text-center"
                          placeholder="State Taxes">
                            {correspondingTax||0}%
                        </label>
                        <label 
                          readOnly = {true}
                          type="text"
                          className="inline-block font-semibold mb-2 text-center"
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
                      state= {{customerInfo: tempCustomer, subtotal: jobPrice, taxRate: correspondingTax, jobDescription: jobDescription, finalPrice: finalPrice, dateOfService: dateOfService, invoiceNumber: invoiceNumber?.trim(), tableData: tableData}}
                      className={`inline-block w-1/2 text-center shadow-md text-sm bg-blue-500 text-white rounded-lg px-4 py-1 font-bold transition ease-in-out duration-300 hover:scale-110 hover:bg-blue-600 ${invoiceNumInvalid ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}`}>
                      Generate PDF
                  </Link>
                </div>      
            </div>
        );
}

export default InvoicePage;