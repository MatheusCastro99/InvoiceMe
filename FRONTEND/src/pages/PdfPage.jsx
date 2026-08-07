import React from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StyleSheet, PDFViewer, pdf, View, Text} from '@react-pdf/renderer';
import {tableDataStyle} from "../pdfStyle";
import {saveAs} from "file-saver"
import MyDocument from "../components/PdfDocument";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import API_ENDPOINTS from "../config/apiConfig";

const styles = tableDataStyle;

const PdfPage = () => {
    const location = useLocation();
    const [newCustomer, setNewCustomer] = useState();
    const rawState = location.state || {};
    const customerInfo = rawState.customerInfo;
    const tableData = rawState.tableData;
    const companyName = rawState.companyName;
    const companyEmail = rawState.companyEmail;
    const phoneNumber = rawState.phoneNumber;
    const streetAddress = rawState.streetAddress;
    const cityAddress = rawState.cityAddress;
    const stateAddress = rawState.stateAddress;
    const zipAddress = rawState.zipAddress;
    const subtotal = typeof rawState.subtotal === 'object' ? Number(rawState.subtotal?.subtotal ?? 0) : Number(rawState.subtotal ?? 0);
    const taxRate = typeof rawState.taxRate === 'object' ? Number(rawState.taxRate?.taxRate ?? 0) : Number(rawState.taxRate ?? 0);
    const finalPrice = typeof rawState.finalPrice === 'object' ? Number(rawState.finalPrice?.finalPrice ?? 0) : Number(rawState.finalPrice ?? 0);
    const dateOfService = rawState.dateOfService;
    const invoiceNumber = rawState.invoiceNumber;
    const jobDescription = rawState.jobDescription;
    
    const handleTableData = () => {
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
  
    console.log(tableData)
    
    const isNew = (customerInfo) => {
      if (customerInfo==undefined) {
        setNewCustomer(false)
      }
      else setNewCustomer(true)
    }

    const saveInvoice = async(e) => { 
      e.preventDefault()
      if(customerInfo.companyName === undefined || dateOfService === undefined || finalPrice===undefined){
        toast.error('Please fill out all input completely');
        return;
      }
      try {
        var saveButton = document.getElementById(`saveButton`)
        const pdfInfo = await axios.post(API_ENDPOINTS.INVOICES.CREATE, 
            {
                companyName:customerInfo.companyName,
                phoneNumber:customerInfo.phoneNumber,
                companyEmail:customerInfo.companyEmail,
                streetAddress:customerInfo.streetAddress,
                cityAddress:customerInfo.cityAddress,
                stateAddress:customerInfo.stateAddress,
                zipAddress:customerInfo.zipAddress,
                subtotal:subtotal,
                taxRate:taxRate,
                jobDescription:jobDescription,
                finalPrice:finalPrice,
                dateOfService:dateOfService,
                invoiceNumber:invoiceNumber,
                tableData:tableData,
            });

        toast.success(`Saved ${customerInfo.companyName}'s Job Successfully`);
        setNewCustomer(false);

      } catch (error) {}     
    }

    const saveFile = () => {

      pdf(<MyDocument
        customerInfo = {customerInfo}
        companyName = {companyName}
        phoneNumber = {phoneNumber}
        companyEmail = {companyEmail}
        streetAddress = {streetAddress}
        cityAddress = {cityAddress}
        stateAddress = {stateAddress}
        zipAddress = {zipAddress}
        subtotal = {subtotal}
        taxRate = {taxRate}
        jobDescription = {jobDescription}
        finalPrice = {finalPrice}
        dateOfService = {dateOfService}
        invoiceNumber = {invoiceNumber}
        tableData = {tableData}
        handleTableData = {handleTableData()}/>)
        .toBlob()
        .then((blob) => saveAs(blob, `#${invoiceNumber} - ${customerInfo?.companyName || companyName}`));
    }

    useEffect(() => {
      isNew(customerInfo);
      handleTableData();
    }, []);

    return (
        <div >
            <div className="flex justify-between">
                <div className="inline-block">
                  <button id="saveButton" onClick={saveInvoice} disabled={!newCustomer} className="mt-3 mb-4 shadow-md bg-blue-700 text-white rounded-xl px-6 py-2 font-bold inline-block transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer enabled:hover:scale-110 disabled:bg-gray-500 disabled:hover:cursor-not-allowed">Save Invoice</button>
                  <Link
                    to="/invoice"
                    className="inline-block mt-3 mb-4 ml-5 shadow-md bg-gray-400 text-white rounded-xl px-6 py-2 font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer hover:scale-110"
                  >
                    Edit Invoice
                  </Link>
                </div>
                <button onClick={saveFile} className="mt-3 mb-4 ml-5 shadow-md bg-blue-700 text-white rounded-xl px-6 py-2 font-bold inline-flex transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer hover:scale-110">Download</button>
            </div>
            <PDFViewer style={styles.viewer}>
                <MyDocument
                    customerInfo = {customerInfo}
                    companyName = {companyName}
                    phoneNumber = {phoneNumber}
                    companyEmail = {companyEmail}
                    streetAddress = {streetAddress}
                    cityAddress = {cityAddress}
                    stateAddress = {stateAddress}
                    zipAddress = {zipAddress}
                    subtotal = {subtotal}
                    taxRate = {taxRate}
                    jobDescription = {jobDescription}
                    finalPrice = {finalPrice}
                    dateOfService = {dateOfService}
                    invoiceNumber = {invoiceNumber}
                    tableData = {tableData}
                    handleTableData = {handleTableData()}/>
            </PDFViewer>
        </div>
    );
}
export default PdfPage

/**/