import { Switch, FormControlLabel } from "@mui/material";
import dayjs from "dayjs"
import {tableDataStyle} from "../pdfStyle";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {pdf, View, Text} from '@react-pdf/renderer';
import MyDocument from "./PdfDocument";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {fas} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import axios from "axios";
import Collapsible from 'react-collapsible';
import { useState } from "react";

const TableInvoice = ({ invoices, getInvoices, customers}) => {
    
  const [delCheckBox, setDelCheckBox] = useState(true);
  const calendarDiv = document.getElementById('calBox');
  const [dates, setDates] = useState(dayjs() || null);
  const [month, setMonth] = useState();
  const [resetCal, setResetCal] = useState();
  const styles = tableDataStyle;
  let invoicesArr = [];

  const saveInvoice = (invoice) => {

      pdf(<MyDocument
        customerInfo = {invoice.customerInfo}
        companyName = {invoice.companyName}
        phoneNumber = {invoice.phoneNumber}
        companyEmail = {invoice.companyEmail}
        streetAddress = {invoice.streetAddress}
        cityAddress = {invoice.cityAddress}
        stateAddress = {invoice.stateAddress}
        zipAddress = {invoice.zipAddress}
        subtotal = {invoice.subtotal}
        taxRate = {invoice.taxRate}
        jobDescription = {invoice.jobDescription}
        finalPrice = {invoice.finalPrice}
        dateOfService = {invoice.dateOfService}
        invoiceNumber = {invoice.invoiceNumber}
        tableData = {invoice.tableData}
        handleTableData = {handleTableData(invoice.tableData)}/>)
        .toBlob()
        .then((blob) => saveAs(blob, `#${invoice.invoiceNumber} - ${invoice.customerInfo?.companyName || invoice.companyName}`));
  }

  const deleteInvoice = async (id) => {
    const result = await Swal.fire({
      title: "Do you want to delete this invoice?",
      text: "You will not be able to revert this change.",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor:"#aaa",
      confirmButtonText: "Delete",
      confirmButtonColor:"#3085d6"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/generateInvoice/${id}`);
        toast.success("Invoice Deleted Successfully");
        getInvoices();
      } catch (error) {
        toast.error(error.message);
        }
    }
  };

  const isProfilePage = (check) => {
    if(check.companyName==undefined) return false;
    else return true;
  }

  const handleCalendarBox = (open) => {
    open?calendarDiv?.classList.add('absolute'):calendarDiv?.classList.remove('absolute');
  }

  const handleMonthChange = (currMonth) => {
    if((currMonth.month()+1) == month){
      setMonth(undefined);
      setResetCal(Math.random());
      return;
    }

    setMonth((currMonth.month() + 1))
    setDates(currMonth);
  }

    const handleCheckBox = () => {
      loadInvoicesArr();
      if (delCheckBox) {
        try {
          setDelCheckBox(false);
        for(let invoiceIndex=0; invoiceIndex<invoicesArr.length; invoiceIndex++) {
          for(let customerIndex=0; customerIndex<customers.length; customerIndex++) {
            if(customers[customerIndex].companyName == invoices[invoiceIndex].companyName) {
              invoices.splice(invoiceIndex, 1)
              invoiceIndex=0
            }
          }
        }
        } catch (error) {
          }
      }

      else {
        setDelCheckBox(true);
        getInvoices()
      }
    }
    const loadInvoicesArr = () => {
      invoices.map((currInvoice) => {
        invoicesArr.push(currInvoice)
      })
    }

    const handleTableData = (tableData) => {
      if(tableData===undefined) return;

        return (
          <View style={styles.table} id="Table">
            <View style={styles.tableRow} id="HeaderRow">
              <View style={styles.tableColHeader} id="ColHeader">
                <Text style={styles.tableCell}>Description</Text>
              </View>
              <View style={styles.tableColHeader} id="ColHeader">
                <Text style={styles.tableCell}>Quantity</Text>
              </View>
              <View style={styles.tableColHeader} id="ColHeader">
                <Text style={styles.tableCell}>Price</Text>
              </View>
              <View style={styles.tableColHeader} id="ColHeader">
                <Text style={styles.tableCell}>Item Total</Text>
              </View>
            </View>
            {tableData.map((row, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{row.quantity}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{"$"+row.price}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{"$"+row.itemTotal}</Text>
                </View>
              </View>
            ))}
            
          </View>
        )}

    let tableItem = () => { 
      return invoices.map((currInvoice) => {

        let monthOfService = parseInt(currInvoice.dateOfService.slice(0, 2));
        //console.log(dates.month(), monthOfService, month);
        if(customers.companyName==undefined && month==undefined) {
          return(
            <tr key={currInvoice._id}>
              <td className="p-4 border-b ">{currInvoice.companyName}</td>
              <td className="p-4 border-b ">{`$${currInvoice.finalPrice}`}</td>
              <td className="p-4 border-b ">{currInvoice.dateOfService}</td>
              <td className="p-4 border-b ">{currInvoice.invoiceNumber}</td>
              <td className="p-4 border-b ">
                <div className="flex gap-2">
                  <button onClick={() => deleteInvoice(currInvoice._id)} className="inline-block text-sm font-semibold text-white px-2 py-1 bg-red-500 rounded transition ease-in-out duration-300 hover:bg-red-700">Delete</button>
                  <Link
                      to = {`/pdfPage`}
                      state= {{companyName: currInvoice.companyName, phoneNumber: currInvoice.phoneNumber, companyEmail: currInvoice.companyEmail, streetAddress: currInvoice.streetAddress, cityAddress: currInvoice.streetAddress, stateAddress: currInvoice.stateAddress, zipAddress: currInvoice.zipAddress,
                                subtotal: currInvoice.subtotal, taxRate: currInvoice.taxRate, jobDescription: currInvoice.jobDescription, finalPrice: currInvoice.finalPrice, 
                                dateOfService: currInvoice.dateOfService, invoiceNumber: currInvoice.invoiceNumber, tableData: currInvoice.tableData}}
                      className="inline-block text-center text-sm bg-blue-500 font-semibold text-white rounded px-2 py-1 transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer">
                      PDF
                  </Link>
                  <button onClick={() => saveInvoice(currInvoice)} className="inline-block text-sm text-white px-2 py-1 bg-gray-500 rounded transition ease-in-out duration-300 hover:bg-gray-700">
                    <FontAwesomeIcon icon={fas.faDownload} className="fa-lg white" />
                  </button>
                </div>
              </td>
              <td className="p-4 border-b ">
                <Collapsible trigger={"Show"}>
                  <p>Job Breakdown: {currInvoice.jobDescription || "Check PDF"}</p>
                  <p>Subtotal: ${currInvoice.subtotal}</p>
                  <p>Tax: ${(currInvoice.subtotal*(currInvoice.taxRate/100)).toFixed(2)}</p>  
                </Collapsible>
              </td>
            </tr>
          )
        }

        else if ((month===monthOfService)) {
          return (
            <tr key={currInvoice._id}>
              <td className="p-4 border-b ">{currInvoice.companyName}</td>
              <td className="p-4 border-b ">{currInvoice.finalPrice}</td>
              <td className="p-4 border-b ">{currInvoice.dateOfService}</td>
              <td className="p-4 border-b ">{currInvoice.invoiceNumber}</td>
              <td className="p-4 border-b ">
                <div className="flex gap-2">
                  <button onClick={() => deleteInvoice(currInvoice._id)} className="inline-block text-sm font-semibold text-white px-2 py-1 bg-red-500 rounded transition ease-in-out duration-300 hover:bg-red-700">Delete</button>
                  <Link
                      to = {`/pdfPage`}
                      state= {{companyName: currInvoice.companyName, phoneNumber: currInvoice.phoneNumber, companyEmail: currInvoice.companyEmail, streetAddress: currInvoice.streetAddress, cityAddress: currInvoice.streetAddress, stateAddress: currInvoice.stateAddress, zipAddress: currInvoice.zipAddress,
                        subtotal: currInvoice.subtotal, taxRate: currInvoice.taxRate, jobDescription: currInvoice.jobDescription, finalPrice: currInvoice.finalPrice, 
                        dateOfService: currInvoice.dateOfService, invoiceNumber: currInvoice.invoiceNumber, tableData: currInvoice.tableData}}
                      className="inline-block text-center text-sm bg-blue-500 font-semibold text-white rounded px-2 py-1 transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer">
                      PDF
                  </Link>
                  <button onClick={() => saveInvoice(currInvoice)} className="inline-block text-sm text-white px-2 py-1 bg-gray-500 rounded transition ease-in-out duration-300 hover:bg-gray-700">
                    <FontAwesomeIcon icon={fas.faDownload} className="fa-lg white" />
                  </button>
                </div>
              </td>
              <td className="p-4 border-b ">
                <Collapsible trigger={"Show"}>
                  <p>Job Breakdown: {currInvoice.jobDescription || "Check PDF"}</p>
                  <p>Subtotal: ${currInvoice.subtotal}</p>
                  <p>Tax: ${(currInvoice.subtotal*(currInvoice.taxRate/100)).toFixed(2)}</p>
                </Collapsible>
              </td>
            </tr>
          );
        }

        else if ((currInvoice.companyName===customers.companyName)) {
          return (
            <tr key={currInvoice._id}>
              <td className="p-4 border-b ">{currInvoice.companyName}</td>
              <td className="p-4 border-b ">{currInvoice.finalPrice}</td>
              <td className="p-4 border-b ">{currInvoice.dateOfService}</td>
              <td className="p-4 border-b ">{currInvoice.invoiceNumber}</td>
              <td className="p-4 border-b ">
                <div className="flex gap-2">
                  <button onClick={() => deleteInvoice(currInvoice._id)} className="inline-block text-sm font-semibold text-white px-2 py-1 bg-red-500 rounded transition ease-in-out duration-300 hover:bg-red-700">Delete</button>
                  <Link
                      to = {`/pdfPage`}
                      state= {{customerInfo: customers, subtotal: currInvoice.subtotal, taxRate: currInvoice.taxRate, jobDescription: currInvoice.jobDescription, finalPrice: currInvoice.finalPrice, dateOfService: currInvoice.dateOfService}}
                      className="inline-block text-center text-sm bg-blue-500 font-semibold text-white rounded px-2 py-1 transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer">
                      PDF
                  </Link>
                  <button onClick={() => saveInvoice(currInvoice)} className="inline-block text-sm text-white px-2 py-1 bg-gray-500 rounded transition ease-in-out duration-300 hover:bg-gray-700">
                    <FontAwesomeIcon icon={fas.faDownload} className="fa-lg white" />
                  </button>
                </div>
              </td>
              <td className="p-4 border-b ">
                <Collapsible trigger={"Show"}>
                  <p>Job Breakdown: {currInvoice.jobDescription || "Check PDF"}</p>
                  <p>Subtotal: ${currInvoice.subtotal}</p>
                  <p>Tax: ${(currInvoice.subtotal*(currInvoice.taxRate/100)).toFixed(2)}</p>
                </Collapsible>
              </td>
            </tr>
          );
        }
    })}
  
    return ( //Table head and content setup
      <div className="mt-6 overflow-auto">
        <div className="inline-block flex mb-2">
          <div className="ml-4 inline-block">
            <FormControlLabel className="shadow-md bg-white w-auto pr-2 text-sm text-center rounded-2xl font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer" disabled={isProfilePage(customers)} control={<Switch onChange={handleCheckBox}/>} label="Deleted Companies" />
          </div>
          <div className="ml-2 inline-block">
            <Collapsible
              className="w-7/12"
              trigger={
                <div className="shadow-md bg-white w-fit text-center rounded-2xl px-6 py-1 mt-1 font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer hover:scale-110">
                  CALENDAR FILTER
                </div>
              }
              onOpening={() => handleCalendarBox(true)}
              onClosing={() => handleCalendarBox(false)}>
                <div id='calBox' className="ml-3 mt-3">
                  <div className="bg-white rounded-xl shadow-lg transition ease-in-out duration-300 hover:bg-gray-100">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateCalendar
                        key={resetCal}
                        views={['month']}
                        openTo={"month"}
                        onChange={(newValue) => handleMonthChange(newValue)}/>
                    </LocalizationProvider>
                  </div>
                </div>
            </Collapsible>
          </div>
        </div>
        <table className="table-auto mx-auto bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left px-4 py-2">Company Name</th>
              <th className="text-left px-4 py-2">Final Price</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Invoice #</th>
              <th className="px-4 py-2">Actions</th>
              <th className="text-left px-4 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {tableItem()}
          </tbody>
        </table>
      </div>
    );
  };

  export default TableInvoice