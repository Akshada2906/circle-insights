import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Exports data to an Excel file.
 * @param data Array of objects containing the data to export.
 * @param fileName Name of the file to save (without extension).
 */
export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exports an Array of Arrays to an Excel file.
 * Useful for custom layouts like transposed data.
 * @param data Array of Arrays containing the data to export.
 * @param fileName Name of the file to save (without extension).
 */
export const exportAoAToExcel = (data: any[][], fileName: string) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};



/**
 * Exports an Array of Arrays to an Excel file with merge configuration and optional styles.
 * @param data Array of Arrays containing the data to export.
 * @param fileName Name of the file to save (without extension).
 * @param merges Array of merge ranges (optional).
 * @param styles Object mapping cell addresses (e.g., 'A1') to style objects (optional).
 * @param cols Array of column width objects (optional).
 */
export const exportFormattedAoAToExcel = (
    data: any[][],
    fileName: string,
    merges?: XLSX.Range[],
    styles?: Record<string, any>,
    cols?: { wch: number }[]
) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    if (cols) {
        worksheet['!cols'] = cols;
    }

    if (merges && merges.length > 0) {
        worksheet['!merges'] = merges;
    }

    if (styles) {
        Object.keys(styles).forEach(cellAddress => {
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = styles[cellAddress];
            }
        });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Exports data to a PDF file with a table.
 * @param data Array of objects containing the data to export.
 * @param columns Array of objects defining the columns (header and dataKey).
 * @param title Title of the PDF document.
 * @param fileName Name of the file to save (without extension).
 * @param orientation Orientation of the PDF ('portrait' or 'landscape'). Defaults to 'portrait'.
 */
export const exportToPDF = (
    data: any[],
    columns: { header: string; dataKey: string }[],
    title: string,
    fileName: string,
    orientation: 'portrait' | 'landscape' = 'portrait'
) => {
    const doc = new jsPDF({ orientation });

    doc.text(title, 14, 22);

    autoTable(doc, {
        startY: 30,
        head: [columns.map((col) => col.header)],
        body: data.map((row) => columns.map((col) => row[col.dataKey])),
    });

    doc.save(`${fileName}.pdf`);
};

/**
 * Exports multiple tables to a single PDF file.
 * @param tables Array of table definitions (title, data, columns).
 * @param fileName Name of the file to save (without extension).
 * @param orientation Orientation of the PDF ('portrait' or 'landscape'). Defaults to 'portrait'.
 */
export const exportMultipleTablesToPDF = (
    tables: { title: string; data: any[]; columns: { header: string; dataKey: string }[] }[],
    fileName: string,
    orientation: 'portrait' | 'landscape' = 'portrait',
    mainTitle?: string // Optional main title for the document
) => {
    const doc = new jsPDF({ orientation });

    // Document metadata
    const date = new Date().toLocaleDateString();
    const primaryColor = [37, 99, 235]; // Blue-600
    const secondaryColor = [241, 245, 249]; // Slate-100 (for alternate rows if needed, mainly controlled by theme)

    // Add Main Title if provided, or use filename as fallback
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(mainTitle || fileName.replace(/_/g, ' '), 14, 20);

    // Add Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${date}`, doc.internal.pageSize.width - 15, 20, { align: 'right' });

    let lastY = 30;

    tables.forEach((table, index) => {
        // Check for page break needing space for title and some rows
        if (index > 0) {
            lastY = (doc as any).lastAutoTable.finalY + 15;
            const pageHeight = doc.internal.pageSize.height;
            // If less than 40mm left, start new page
            if (lastY > pageHeight - 40) {
                doc.addPage();
                lastY = 20;
            }
        }

        // Section Title
        doc.setFontSize(14);
        doc.setTextColor(0); // Black
        doc.setFont('helvetica', 'bold');
        doc.text(table.title, 14, lastY);

        autoTable(doc, {
            startY: lastY + 5,
            head: [table.columns.map((col) => col.header)],
            body: table.data.map((row) => table.columns.map((col) => row[col.dataKey])),
            theme: 'grid', // Use grid for better separation
            headStyles: {
                fillColor: primaryColor as [number, number, number],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                textColor: [50, 50, 50]
            },
            alternateRowStyles: {
                fillColor: secondaryColor as [number, number, number]
            },
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3,
                overflow: 'linebreak'
            },
            columnStyles: {
                // Add specific column styles if needed, e.g. currency right aligned
            },
        });
    });

    // Add Footer with Page Numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
        doc.text(
            'Project Insighter',
            14,
            doc.internal.pageSize.height - 10
        );
    }

    doc.save(`${fileName}.pdf`);
};
