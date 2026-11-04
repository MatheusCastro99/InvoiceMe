import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { parseDollarsToCents, formatCents, centsToDollarString } from "../utils/money";

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

const InvoicePage = () => {
    // The invoice carried back from the PDF page ("Edit Invoice"), in either of its two shapes; none when opened from the home page.
    // Amounts in it are integer cents (ADR-012); a stored invoice from before cents has none, and starts with empty amounts.
    const carried = useLocation().state;
    const carriedLines = Array.isArray(carried?.lineItems) ? carried.lineItems : [];
    const carriedRows = carriedLines.map((line) => ({
        description: line.description,
        quantity: String(line.quantity),
        price: centsToDollarString(line.unitPriceCents),
    }));

    const [manualSubtotal, setManualSubtotal] = useState(() => (carriedLines.length === 0 ? centsToDollarString(carried?.subtotalCents) : ""));
    const [jobDescription, setJobDescription] = useState(carried?.jobDescription);
    const [customers, setCustomers] = useState([]);
    const [tempCustomer, setTempCustomer] = useState([]);
    const [correspondingTax, setCorrespondingTax] = useState();
    // The server's answer for one subtotal at one rate; it counts only while both still match the page
    const [totals, setTotals] = useState(null);
    const [dateOfService, setDateOfService] = useState(carried?.dateOfService || '');
    const [invoiceNumber, setInvoiceNumber]= useState(carried?.invoiceNumber);
    const [dateTouched, setDateTouched] = useState(false);
    const [invoiceNumValidity, setInvoiceNumValidity] = useState(false);
    const [invoiceNumChecked, setInvoiceNumChecked] = useState(false);
    const [invoicesArr, setInvoicesArr] = useState([]);
    const [openTable, setOpenTable] = useState(carriedRows.length > 0);
    // The table's valid lines (each with its displayed line total) and whether every filled row is valid
    const [tableLines, setTableLines] = useState(() => ({ lineItems: carriedLines, valid: true }));

    // Only the displayed line totals and subtotal are derived here (ADR-004): the sum of the line totals, or the typed amount.
    // null when an amount is invalid or too large; the total is then held.
    const lineItems = openTable ? tableLines.lineItems : [];
    const linesSum = lineItems.reduce((sum, line) => sum + line.lineTotalCents, 0);
    let subtotalCents = null;
    if (openTable) {
        subtotalCents = tableLines.valid && Number.isSafeInteger(linesSum) ? linesSum : null;
    } else if (manualSubtotal.trim() === "") {
        subtotalCents = 0;
    } else {
        subtotalCents = parseDollarsToCents(manualSubtotal);
    }
    const subtotalInvalid = !openTable && manualSubtotal.trim() !== "" && subtotalCents === null;

    const totalsCurrent = totals !== null && totals.subtotalCents === subtotalCents && totals.taxRate === correspondingTax;
    const totalReady = subtotalCents === 0 || totalsCurrent;
    const taxCents = subtotalCents === 0 ? 0 : totals?.taxCents;
    const finalPriceCents = subtotalCents === 0 ? 0 : totals?.finalPriceCents;

    // Asks the server for the state's rate; the total follows from the effect below.
    const selectCustomer = async (id) => {
        try {
            const info = await axios.get(API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id));
            const payload = info?.data?.data ?? info?.data ?? {};
            setTempCustomer(payload);
            await handleTax(payload.stateAddress);
        } catch (error) {
            // A refused rate (a customer with no state or one the tax table lacks, say) is shown, not swallowed
            setTempCustomer([]);
            setCorrespondingTax();
            toast.error(error.response?.data?.message ?? error.message);
        }
    }

    // The total always comes from the server (ADR-004), only for a valid subtotal above 0 and a known rate.
    // Nothing is requested while a row or the typed amount is invalid, and an answer for an older subtotal is dropped.
    useEffect(() => {
        if (!subtotalCents || correspondingTax === undefined) return;
        let stale = false;
        axios.post(API_ENDPOINTS.TAX.CALCULATE, { subtotalCents, taxRate: correspondingTax })
            .then((response) => {
                if (stale) return;
                const data = response?.data?.data ?? response?.data;
                setTotals({ subtotalCents, taxRate: correspondingTax, taxCents: data?.taxCents, finalPriceCents: data?.finalPriceCents });
            })
            .catch((error) => {
                if (stale) return;
                setTotals(null);
                toast.error(error.response?.data?.message ?? error.message);
            });
        return () => { stale = true; };
    }, [subtotalCents, correspondingTax]);

    const requestInfo = (e) => {
        if(e.target.value == "Select Company") {
          setTempCustomer([]);
          setCorrespondingTax();
          return;
        }
        selectCustomer(e.target.value);
    }

    const getInvoices = async() => {
      try {
          const response = await axios.get(API_ENDPOINTS.INVOICES.LIST);
          //console.log(response.data);
          const payload = response?.data?.data ?? response?.data ?? [];
          setInvoicesArr(payload);
          // A number carried back from the PDF page is checked against the list just fetched.
          if (typeof carried?.invoiceNumber === "string" && carried.invoiceNumber.trim() !== "") {
            validateInvoiceNum(carried.invoiceNumber, payload);
          }
        } catch (error) {
          toast.error(error.message);
        }
  }

    const handleTax = async(state) => {
      const getTaxRate = await axios.post(API_ENDPOINTS.TAX.GET_RATE, {state:state});
      const fetchedRate = getTaxRate?.data?.data ?? getTaxRate?.data;
      const parsedRate = typeof fetchedRate === "object" ? fetchedRate?.taxRate : fetchedRate;
      const rate = Number(parsedRate) || 0;
      setCorrespondingTax(rate);
      return rate;
    }

    // Same rule as the server (ADR-003): blank and an exact match (after trimming) of a stored number are blocked.
    // A gap or a lower number compared with the newest invoice only warns.
    const validateInvoiceNum = (value, invoices = invoicesArr) => {
      const num = value.trim();
      const newest = invoices[0];
      const newestNum = newest?.invoiceNumber?.trim();
      setInvoiceNumChecked(true);

      if (num === "") {
        toast.error("Invoice number is required");
        setInvoiceNumValidity(false);
        return;
      }

      if (invoices.some((invoice) => invoice.invoiceNumber?.trim() === num)) {
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
      if(!(dateIsValid&&invoiceNumValidity) || !subtotalCents) {
        e.preventDefault();
        toast.error(
          <div>
              <p>Check Date, Invoice Number, and Subtotal</p> <br/>
          </div>
        )
      } else if (!totalReady) {
        // The fields are fine; the server's tax and total are what's missing
        e.preventDefault();
        toast.error(correspondingTax === undefined
          ? "Pick a company to get the tax and total"
          : "The total isn't ready yet");
      }
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
            // The carried customer is selected by id, or else by the one customer whose phone digits match (a stored invoice has no id).
            const carriedPhone = digitsOnly(carried?.customerInfo?.phoneNumber ?? carried?.phoneNumber);
            const byId = carried?.customerInfo?._id && payload.find((c) => c._id === carried.customerInfo._id);
            const byPhone = carriedPhone ? payload.filter((c) => digitsOnly(c.phoneNumber) === carriedPhone) : [];
            const match = byId || (byPhone.length === 1 ? byPhone[0] : null);
            if (match) {
                selectCustomer(match._id);
            }
        } catch (error) {
            toast.error(error.message);
        }};

    // Run once on mount: the carried invoice (if any) is read from router state and checked against the lists just fetched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect( () => {fetchData(), getInvoices()},[]);
        return (
            <div className="max-w-xl bg-white shadow-lg mx-auto p-7 rounded-sm mt-6">
                <h2 id="home" className="font-semibold text-2xl mb-4 block text-center">
                    Generate Invoice
                </h2>
                <div className="w-full px-4">
                    <div className="mt-3">
                        <Select value={tempCustomer?._id || "Select Company"} onChange = {(e)=>(requestInfo(e))} id="customers" required>
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
                    <div className="ml-3 font-semibold"><FormControlLabel control={<Switch checked={openTable} onChange={handleJobInfo}/>}/>Table Form</div>
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
                            initialRows = {carriedRows}
                            dataCallBack = {setTableLines} />
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
                          value={openTable ? (subtotalCents === null ? "—" : subtotalCents === 0 ? "" : centsToDollarString(subtotalCents)) : manualSubtotal}
                          onChange={(e) => setManualSubtotal(e.target.value)}
                          aria-invalid={subtotalInvalid}
                          aria-describedby={subtotalInvalid ? "subtotalError" : undefined}
                          className={`w-full font-semibold text-lg mb-2 block text-right${subtotalInvalid ? " border border-red-500" : ""}`}
                          placeholder="Enter Job Subtotal"
                        />
                        {subtotalInvalid && <p id="subtotalError" className="text-sm text-red-600 text-right mb-2">Enter an amount like 19.99</p>}
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
                            {totalReady ? formatCents(taxCents) : "—"}
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
                          value={totalReady ? formatCents(finalPriceCents) : "—"}
                        />
                    </div>
                  </Collapsible>
                </div>
                <div className="w-full flex justify-center">
                    <Link
                      id="pdfButton"
                      to = {`/pdfPage`}
                      onClick={checkValidity}
                      state= {{customerInfo: tempCustomer, subtotalCents: subtotalCents, taxRate: correspondingTax, taxCents: taxCents, finalPriceCents: finalPriceCents, jobDescription: jobDescription, dateOfService: dateOfService, invoiceNumber: invoiceNumber?.trim(), lineItems: lineItems}}
                      className={`inline-block w-1/2 text-center shadow-md text-sm bg-blue-500 text-white rounded-lg px-4 py-1 font-bold transition ease-in-out duration-300 hover:scale-110 hover:bg-blue-600 ${invoiceNumInvalid ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}`}>
                      Generate PDF
                  </Link>
                </div>      
            </div>
        );
}

export default InvoicePage;