import { useState } from "react";
import { TextField } from "@mui/material";
import { parseDollarsToCents, parseQuantity, lineTotalCents, formatCents } from "../utils/money";

const emptyRow = (id) => ({
    id,
    description: "",
    quantity: "",
    price: "",
});

// A row with nothing typed in it is skipped, not flagged
const isBlank = (row) => row.description.trim() === "" && row.quantity.trim() === "" && row.price.trim() === "";

// What one row holds once parsed with the server's rules (ADR-003); a field that fails is null.
// The row total is for display only: the server computes the stored one (ADR-004).
const parseRow = (row) => {
    const description = row.description.trim() === "" ? null : row.description.trim();
    const quantity = parseQuantity(row.quantity);
    const unitPriceCents = parseDollarsToCents(row.price);
    const total = quantity !== null && unitPriceCents !== null ? lineTotalCents(quantity, unitPriceCents) : null;
    return { description, quantity, unitPriceCents, lineTotalCents: total };
};

// The valid rows as line items, and whether every row that is not blank is valid
const summarize = (rows) => {
    const lineItems = [];
    let valid = true;
    rows.forEach((row) => {
        if (isBlank(row)) return;
        const parsed = parseRow(row);
        if (parsed.description === null || parsed.lineTotalCents === null) {
            valid = false;
            return;
        }
        lineItems.push(parsed);
    });
    return { lineItems, valid };
};

const TableDescription = (props) => {
    // Rows carried back from the PDF page seed the table; otherwise start with one empty row so it is usable immediately.
    const initialRows = props.initialRows?.length ? props.initialRows.map((row, index) => ({ ...row, id: index + 1 })) : null;
    const [rows, setRows] = useState(() => initialRows ?? [emptyRow(1)]);
    const [rowNum, setRowNum] = useState(() => (initialRows ? initialRows.length : 1) + 1);
    const dataCallBack = props.dataCallBack;

    // Tells the page the valid lines and whether every filled row is valid; the page holds the total while one is not
    const report = (updatedRows) => dataCallBack(summarize(updatedRows));

    const addItemRow = () => {
        setRows(prevRows => [...prevRows, emptyRow(rowNum)]);
        setRowNum(rowNum + 1);
    };

    const subItemRow = () => {
        if (rows.length === 1) return;

        const updatedRows = rows.slice(0, -1);
        setRows(updatedRows);
        setRowNum(rowNum > 1 ? rowNum-1 : 1);

        report(updatedRows);
    }

    const handleChange = (rowIndex, field, value) => {
        const updatedRows = rows.map((row, i) => (i === rowIndex ? { ...row, [field]: value } : row));
        setRows(updatedRows);
        report(updatedRows);
    }

    const cell = (row, rowIndex, field, label, invalid, message, size) => (
        <TextField
            size="small"
            value={row[field]}
            onChange={(e) => handleChange(rowIndex, field, e.target.value)}
            error={invalid}
            helperText={invalid ? message : undefined}
            slotProps={{ htmlInput: { "aria-label": `${label}, row ${rowIndex + 1}`, size } }}
        />
    );

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
                        const filled = !isBlank(row);
                        const parsed = parseRow(row);
                        return (
                            <tr key={row.id}>
                                <td className="border align-top p-1">
                                    {cell(row, rowIndex, "description", "Item", filled && parsed.description === null, "Enter a description")}
                                </td>
                                <td className="border align-top p-1">
                                    {cell(row, rowIndex, "quantity", "Quantity", filled && parsed.quantity === null, "More than 0, up to 2 decimals", 8)}
                                </td>
                                <td className="border align-top p-1">
                                    {cell(row, rowIndex, "price", "Each price", filled && parsed.unitPriceCents === null, "An amount like 19.99", 8)}
                                </td>
                                <td className="border align-top p-1 text-right font-semibold" aria-live="polite">
                                    {filled ? formatCents(parsed.lineTotalCents ?? undefined) : ""}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div> )
}

export default TableDescription
