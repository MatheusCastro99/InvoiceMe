import React from "react";
import { useLocation } from "react-router-dom";
import { StyleSheet, PDFViewer } from '@react-pdf/renderer';
import MyDocument from "../components/PdfDocument";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const styles = StyleSheet.create({
    viewer: {
      width: "100%",
      height: "880px",
    },
  });

const PdfPage = () => {
    const location = useLocation();
    const customerInfo = location.state.customerInfo;
    const {companyName}= location.state;
    const {companyEmail}= location.state;
    const {phoneNumber}= location.state;
    const {streetAddress}= location.state;
    const {cityAddress}= location.state;
    const {stateAddress}= location.state;
    const {zipAddress}= location.state;    
    const {subtotal} = location.state;
    const {taxRate} = location.state;
    const {jobDescription} = location.state;
    const {finalPrice} = location.state;
    const {dateOfService} = location.state;
    const {invoiceNumber} = location.state;

    console.log(customerInfo)
    
    const isNew = (customerInfo) => {
      if (customerInfo==undefined) return false
      else return true
    }

    const saveInvoice = async(e) => { 
      e.preventDefault()
      if(customerInfo.companyName === undefined || dateOfService === undefined || finalPrice===undefined){
        toast.error('Please fill out all input completely');
        return;
    }
      try {
        const pdfInfo = await axios.post(`http://localhost:3000/api/generateInvoice`, 
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
            });

        toast.success(`Saved ${customerInfo.companyName}'s Job Successfully`); 
      } catch (error) {}     
    }

    return (
        <div >
            <div>
                <button onClick={saveInvoice} disabled={!isNew(customerInfo)} className="mt-3 mb-4 shadow-md bg-blue-700 text-white rounded-xl px-6 py-2 font-bold transition ease-in-out duration-300 hover:bg-blue-600 hover:cursor-pointer enabled:hover:scale-110 disabled:bg-gray-500 disabled:hover:cursor-not-allowed">Save Invoice</button>
                <Link
                  to="/invoice"
                  className="inline-block mt-3 ml-5 shadow-md bg-gray-400 text-white rounded-xl px-6 py-2 font-bold transition ease-in-out duration-300 hover:bg-gray-300 hover:cursor-pointer hover:scale-110"
                >
                  Edit Invoice
                </Link>
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
                    invoiceNumber = {invoiceNumber}/>
            </PDFViewer>
        </div>
    );
}
export default PdfPage

/**/