import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExcelExport = (data, fileName) => {
    if (!data || data.length === 0) {
        alert("No data to export");
        return;
    }

    // Filter out unwanted fields
    const filteredData = data.map(
        ({ _id, createdAt, updatedAt, delete: del, __v, ...rest }) => rest
    );

    const capitalizedData = filteredData.map((item) => {
        const formattedItem = {};
        Object.keys(item).forEach((key) => {
            let value = item[key];

            // ✅ Special handling for "address"
            if (key === "address" && typeof value === "object" && value?.full_address) {
                value = value.full_address;
            }

            if (key === "password") {
                value = "********";
            }

            if (key === "materials") {
                value = value?.map((m) => m.name).join(', ');
            }

            // Convert camelCase to "camel case"
            const capitalizedKey = key.replace(/([A-Z])/g, " $1").toLowerCase();
            formattedItem[capitalizedKey] = value;
        });
        return formattedItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(capitalizedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
                font: { bold: true },
            };
        }
    }

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
    });

    const excelData = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(excelData, fileName);
};

export default ExcelExport;
