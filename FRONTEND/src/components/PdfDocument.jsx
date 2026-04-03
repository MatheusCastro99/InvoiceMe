import React from 'react';
import { Page, Text, View, Document, Image, Line, Svg } from '@react-pdf/renderer';
import {pageBox, headerBox, jobInfoBox, priceInfoBox, companyInfoBox, footerBox} from "../pdfStyle";
import Logo from "../assets/KenTechLogo.jpg"

const MyDocument = (info) => {
    const customerInfo = info.customerInfo;
    const {companyName} = info;
    const {companyEmail} = info;
    const {phoneNumber} = info;
    const {streetAddress} = info;
    const {cityAddress} = info;
    const {stateAddress} = info;
    const {zipAddress} = info;
    const {subtotal} = info;
    const {taxRate} = info;
    const {jobDescription} = info;
    const {finalPrice} = info;
    const {dateOfService} = info;
    const {invoiceNumber} = info;
    const handlaTableData = info.handleTableData;
    console.log(customerInfo, info)

    return (
            <Document title={`#${invoiceNumber} / ${customerInfo?.companyName||companyName}`}>
                <Page size="a4" style={pageBox.page}>
            <View style={headerBox.header}>
                <Image style={headerBox.logo} src= {Logo}/>
                <View style={headerBox.titleAddressBox}>
                    <Text>Ken-Tech Maintenance</Text>
                    <Text style={headerBox.addressNumber}>692 Selfmaster PKWY, Union, NJ - 07083</Text>
                    <Text style={headerBox.addressNumber}>908-838-5832</Text>
                </View>
                <View style={headerBox.dateInvoiceBox}>
                    <Text style={headerBox.dateInvoice}>{dateOfService}</Text>
                    <Text style={headerBox.dateInvoice}>Invoice #{invoiceNumber}</Text>
                </View>
            </View>

            <Svg height="5">
                <Line 
                    x1="50"
                    y1="0"
                    x2="550"
                    y2="0"
                    strokeWidth={3}
                    stroke= "gray"/>
            </Svg>
            
            <View style={companyInfoBox.info}>
                <View style={companyInfoBox.textBox}>
                    <Text style={companyInfoBox.title}>Customer Info:</Text>
                    <Text style={companyInfoBox.text}>Name: {customerInfo?.companyName||companyName}</Text>
                    <View>
                        <Text style={companyInfoBox.text}>Address: {customerInfo?.streetAddress||streetAddress}</Text>
                        <Text style={companyInfoBox.spacingCityState}>{customerInfo?.cityAddress||cityAddress}</Text>
                        <Text style={companyInfoBox.spacingCityState}>{customerInfo?.stateAddress||stateAddress} - {customerInfo?.zipAddress||zipAddress}</Text>
                    </View>
                    <Text style={companyInfoBox.text}>Phone: {customerInfo?.phoneNumber||phoneNumber}</Text>
                    <Text style={companyInfoBox.text}>Email: {customerInfo?.companyEmail||companyEmail}</Text>
                </View>
            </View>

            <View style={jobInfoBox.jobInfoFields}>
                <Text style={jobInfoBox.title}>Job Breakdown:</Text>
                <View>
                    {jobDescription===undefined?handlaTableData:<Text style={jobInfoBox.jobDescription}>{jobDescription}</Text>}
                </View>
            </View>
            <View style={priceInfoBox.fields}>
                <Text style={priceInfoBox.title}>Price:</Text>
                <View>
                    <Text style={priceInfoBox.text}>Subtotal: ${Number(subtotal).toFixed(2)}</Text>
                    <Text style={priceInfoBox.text}>Tax Rate ({taxRate}%): ${(subtotal*(taxRate/100)).toFixed(2)}</Text>
                    <Text style={priceInfoBox.text}>Total: ${Number(finalPrice).toFixed(2)}</Text>
                </View>
            </View>
            <View>
                <Text style={footerBox.sentence}>CHECK TO BE MADE NOMINAL TO:</Text>
                <Text style={footerBox.kenTech}>KEN-TECH MAINTENANCE LLC</Text>
                <Text style={footerBox.sentence}>THANK YOU FOR YOUR BUSINESS!</Text>
            </View>
        </Page>
        
    </Document>
    )
};

export default MyDocument

/* */