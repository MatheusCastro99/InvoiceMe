import { Switch, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import Collapsible from 'react-collapsible';
import { useState, useEffect } from "react";
import React from "react";

const TableDescription = (props) => {
    const [rows, setRows] = useState([]);
    const [rowNum, setRowNum] = useState(1);
    const dataCallBack = props.dataCallBack;
    //const [jobDataTable, setJobDataTable] = useState([])

    const addItemRow = () => {
        const newRow = {
            id: rowNum,
            description: "",
            quantity: "",
            price: "",
            itemTotal: ""
        };

        setRows(prevRows => [...prevRows, newRow]);
        setRowNum(rowNum + 1);
    };

    const subItemRow = () => {
        if (rows.length === 1) return;

        const updatedRows = rows.slice(0, -1);
        setRows(updatedRows);
        setRowNum(rowNum > 1 ? rowNum-1 : 1);

        dataCallBack(updatedRows);
    }

    const handleChange = (rowIndex, field, value) => {
        const updatedRows = [...rows];

        updatedRows[rowIndex][field] = value;
        updatedRows[rowIndex]['itemTotal'] = parseFloat(((updatedRows[rowIndex]['price'] * updatedRows[rowIndex]['quantity'])).toFixed(2), 10)

        setRows(updatedRows);
        dataCallBack(updatedRows);
    }

    //useEffect(()=>{console.log(rows)})
    useEffect(() => addItemRow, [])

    return (
        <div className="overflow-auto">
            <div className="mb-2">
                <label className="font-semibold row">Rows: </label>
                <button className="font-semibold row transition ease-in-out duration-300 hover:scale-150 hover:cursor-pointer" onClick={addItemRow}> + </button>
                <button className="font-semibold row mx-1 transition ease-in-out duration-300 hover:scale-150 hover:cursor-pointer" onClick={subItemRow}> - </button>
            </div>
            <table className="table-auto mx-auto bg-white border-collapse">
                <thead className="bg-gray-200">
                  <tr className="border">
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">QTY/HRS</th>
                    <th className="text-left py-2">Ea. Price</th>
                    <th className="text-left py-2">Item Total</th>
                  </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => {
                        return (
                            <tr key={row.id}>
                                <td className="border">
                                    <input 
                                        type="text"
                                        value={row.description}
                                        onChange={(e) => handleChange(rowIndex, 'description', e.target.value)} />
                                </td>
                                <td className="border">
                                    <input 
                                        size="8"
                                        type="text" 
                                        value={row.quantity}
                                        onChange={(e) => handleChange(rowIndex, 'quantity', e.target.value)}/>
                                </td>
                                <td className="border">
                                    <input 
                                        size="8"
                                        type="text"
                                        value={row.price}
                                        onChange={(e) => handleChange(rowIndex, 'price', e.target.value)}/>
                                </td>
                                <td className="border">
                                    <input 
                                        size="8"
                                        type="text"
                                        readOnly={true}
                                        value={row.itemTotal}
                                        onChange={(e) => handleChange(rowIndex, 'itemTotal', e.target.value)}/>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div> )
}

export default TableDescription