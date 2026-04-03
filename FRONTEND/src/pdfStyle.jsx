import { StyleSheet } from '@react-pdf/renderer';

const pageBox = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "white",
    },
})

const headerBox = StyleSheet.create({
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },

    header: {
        margin: 10,
        padding: 10,
        alignItems: "center",
        justifyContent: "space-evenly",
        flexDirection: "row"
    },

    logo: {
        height: "70px",
        width: "70px"
    },

    titleAddressBox: {
        flexDirection: "column",
        alignItems: "center",
    },

    addressNumber: {
        fontSize: "12px",
        marginTop: 3
    },

    dateInvoiceBox: {
        flexDirection: "column",
        alignItems: "left",
    },

    dateInvoice: {
        fontSize: "13px"
    }
})

const companyInfoBox = StyleSheet.create({
    info: {
        margin: 10,
        padding: 10,
        alignItems: "left",
        flexDirection: "column",
    },

    title: {
        fontSize: "17px",
        marginBottom: 6
    },

    textBox: {
        marginTop: 2
    },

    text: {
        fontSize: "15px",
        marginBottom: 3,
        marginLeft: 25
    },

    spacingCityState: {
        paddingLeft: 88,
        marginBottom: 3,
        fontSize: "15px"
    }
})

const jobInfoBox = StyleSheet.create({
    jobInfoFields: {
        margin: 10,
        padding: 10,
        alignItems: "left",
        flexDirection: "column",
    },

    title: {
        fontSize: "17px",
        marginBottom: 6
    },

    jobDescription: {
        fontSize: "15px",
        marginBottom: 3,
        marginLeft: 25,
        alignSelf: "center",
    }
})

const priceInfoBox = StyleSheet.create({
    fields: {
        margin: 10,
        padding: 10,
        alignItems: "left",
        flexDirection: "column",
    },

    title: {
        fontSize: "17px",
        marginBottom: 6
    },

    text: {
        fontSize: "15px",
        marginBottom: 3,
        marginLeft: 25
    }
})

const footerBox = StyleSheet.create({
    sentence: {
        alignSelf: "center",
        fontSize: "12px",
        marginBottom: 3,
        fontWeight: "extralight"
    },

    kenTech: {
        fontWeight: "extrabold",
        alignSelf: "center",
        fontSize: "15px",
        marginBottom: 5
    }
})

const tableDataStyle = StyleSheet.create({
    viewer: {
      width: "100%",
      height: "880px",
    },
    table: {
      display: 'table',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#000',
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableColHeader: {
      width: '33.33%',
      borderStyle: 'solid',
      borderBottomWidth: 1,
      backgroundColor: '#f2f2f2',
      padding: 5,
      fontWeight: 'bold',
    },
    tableCol: {
      width: '33.33%',
      borderStyle: 'solid',
      borderBottomWidth: 1,
      padding: 5,
    },
    tableCell: {
      margin: 5,
      fontSize: 10,
    },
  });

export {pageBox, headerBox, jobInfoBox, priceInfoBox, companyInfoBox, footerBox, tableDataStyle}