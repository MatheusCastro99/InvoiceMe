import { useState } from "react";

const emptyRow = (id) => ({
    id,
    description: "",
    quantity: "",
    price: "",
    itemTotal: ""
});

const TableDescription = (props) => {
    // Start with one empty row so the table is usable immediately.
    const [rows, setRows] = useState(() => [emptyRow(1)]);
    const [rowNum, setRowNum] = useState(2);
    const dataCallBack = props.dataCallBack;

    const addItemRow = () => {
        setRows(prevRows => [...prevRows, emptyRow(rowNum)]);
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
        const updatedRow = { ...rows[rowIndex], [field]: value };
        updatedRow.itemTotal = parseFloat((updatedRow.price * updatedRow.quantity).toFixed(2), 10);

        const updatedRows = rows.map((row, i) => (i === rowIndex ? updatedRow : row));
        setRows(updatedRows);
        dataCallBack(updatedRows);
    }

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