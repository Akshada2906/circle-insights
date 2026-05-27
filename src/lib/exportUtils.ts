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
 * Exports multiple Arrays of Arrays to an Excel file with multiple sheets, merge configurations, and optional styles.
 * @param sheets Array of sheet definitions containing data, sheetName, merges, styles, and cols.
 * @param fileName Name of the file to save (without extension).
 */
export const exportMultipleSheetsFormattedAoAToExcel = (
    sheets: {
        sheetName: string;
        data: any[][];
        merges?: XLSX.Range[];
        styles?: Record<string, any>;
        cols?: { wch: number }[];
    }[],
    fileName: string
) => {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ sheetName, data, merges, styles, cols }) => {
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

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

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

/**
 * Helper to cleanly format any insight item (string or object) to human-readable text.
 */
export const getInsightItemText = (item: any): string => {
    if (item === undefined || item === null) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
        const keys = Object.keys(item);
        
        // 1. Search for main text/message keys case-insensitively
        const textKey = keys.find(k => ['pattern', 'opportunity', 'pitch', 'gap', 'message', 'text', 'description', 'title'].includes(k.toLowerCase()));
        if (textKey && item[textKey]) {
            let val = String(item[textKey]);
            
            // Look for metadata keys to enrich the display string
            const severityKey = keys.find(k => k.toLowerCase() === 'severity');
            const impactKey = keys.find(k => ['impact', 'business_impact'].includes(k.toLowerCase()));
            const affectedKey = keys.find(k => ['affected_accounts', 'affected accounts', 'affected'].includes(k.toLowerCase()));
            
            const parts = [val];
            if (severityKey && item[severityKey]) {
                parts.push(`[Severity: ${String(item[severityKey]).toUpperCase()}]`);
            }
            if (impactKey && item[impactKey]) {
                parts.push(`(Impact: ${item[impactKey]})`);
            }
            if (affectedKey && item[affectedKey]) {
                const affVal = Array.isArray(item[affectedKey]) ? item[affectedKey].join(', ') : String(item[affectedKey]);
                if (affVal.trim() && affVal !== '—' && affVal !== '[]') {
                    parts.push(`- Affected: ${affVal}`);
                }
            }
            return parts.join(' ');
        }
        
        // 2. Fallback to format all keys/values nicely
        return Object.entries(item)
            .map(([k, v]) => {
                const formattedKey = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const formattedValue = Array.isArray(v) ? v.join(', ') : String(v);
                return `${formattedKey}: ${formattedValue}`;
            })
            .join(' | ');
    }
    return String(item);
};

/**
 * Exports strategic AI insights for PE, Account, or Project to a styled PDF report.
 * @param type Entity type ('pe' | 'account' | 'project')
 * @param entityName Display name of the entity
 * @param parsedInsights The parsed insights object
 */
export const exportInsightsToPDF = (
    type: 'pe' | 'account' | 'project',
    entityName: string,
    parsedInsights: any
) => {
    if (!parsedInsights) return;

    const doc = new jsPDF({ orientation: 'portrait' });
    const primaryColor = [37, 99, 235]; // Blue-600 (Project Insighter primary)
    const secondaryColor = [241, 245, 249]; // Slate-100
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Helper to format string keys/values to Title Case and space out underscores
    const formatPdfStr = (val: any): string => {
        if (val === undefined || val === null) return '—';
        const str = String(val).trim();
        if (!str) return '—';
        if (str.includes('_') || (!str.includes(' ') && str.toLowerCase() === str && str.length < 30)) {
            return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
        return str;
    };
    
    // Header Info
    const reportTitle = type === 'pe' 
        ? 'Portfolio Strategic Synthesis Report' 
        : type === 'account' 
            ? 'Account Strategic AI Insights' 
            : 'Project Strategic AI Insights';
            
    // 1. Cover / Header Banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title inside banner
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 14, 18);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entity: ${formatPdfStr(entityName)}`, 14, 26);
    
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const dateStr = new Date(parsedInsights.generated_at || Date.now()).toLocaleString();
    doc.text(`Generated on: ${dateStr}`, pageWidth - 14, 26, { align: 'right' });
    
    let currentY = 50;
    
    // 2. Core Performance Indicators / Health Metrics
    const metrics: string[] = [];
    if (parsedInsights.overall_health) {
        if (parsedInsights.overall_health.portfolio_health) {
            metrics.push(`Portfolio Health: ${formatPdfStr(parsedInsights.overall_health.portfolio_health)}`);
        }
        if (parsedInsights.overall_health.transformation_maturity) {
            metrics.push(`Transformation Maturity: ${formatPdfStr(parsedInsights.overall_health.transformation_maturity)}`);
        }
    } else {
        if (parsedInsights.portfolio_health) {
            metrics.push(`Portfolio Health: ${formatPdfStr(parsedInsights.portfolio_health)}`);
        }
        if (parsedInsights.transformation_maturity) {
            metrics.push(`Transformation Maturity: ${formatPdfStr(parsedInsights.transformation_maturity)}`);
        }
    }
    
    if (parsedInsights.health_score !== undefined) {
        metrics.push(`Health Score: ${parsedInsights.health_score}`);
    }
    if (parsedInsights.confidence_score !== undefined) {
        metrics.push(`Confidence Score: ${Math.round(parsedInsights.confidence_score * 100)}%`);
    }
    
    if (metrics.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Performance Indicators', 14, currentY);
        currentY += 6;
        
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        
        const metricsStr = metrics.join('   |   ');
        const metricsLines = doc.splitTextToSize(metricsStr, pageWidth - 28);
        doc.text(metricsLines, 14, currentY);
        currentY += metricsLines.length * 5 + 8;
    }
    
    // 3. Executive Summary
    const summaryText = parsedInsights.executive_summary || parsedInsights.summary || '';
    if (summaryText) {
        if (currentY > pageHeight - 35) {
            doc.addPage();
            currentY = 20;
        }
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('Executive Summary', 14, currentY);
        currentY += 6;
        
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105); // Slate-600
        const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 28);
        doc.text(summaryLines, 14, currentY);
        currentY += summaryLines.length * 5 + 10;
    }
    
    // Helper to add sections and tables
    const addTableSection = (title: string, headers: string[], rows: any[][], columnWidths?: any) => {
        // Check page overflow before title
        if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, currentY);
        currentY += 4;
        
        autoTable(doc, {
            startY: currentY,
            head: [headers],
            body: rows,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor as [number, number, number],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            bodyStyles: {
                textColor: [50, 50, 50],
                fontSize: 8.5,
            },
            alternateRowStyles: {
                fillColor: secondaryColor as [number, number, number]
            },
            styles: {
                font: 'helvetica',
                cellPadding: 3,
                overflow: 'linebreak'
            },
            columnStyles: columnWidths,
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 12;
    };
    
    // 4. Risks Table
    if (Array.isArray(parsedInsights.risks) && parsedInsights.risks.length > 0) {
        const headers = ['Risk/Pattern', 'Severity', 'Description', 'Affected Entity/Project'];
        const rows = parsedInsights.risks.map((r: any) => {
            const riskMsg = r.risk || r.message || r.type || '';
            const sev = r.severity || r.level || 'High';
            const desc = r.description || r.business_impact || '';
            const affected = Array.isArray(r.affected_accounts) 
                ? r.affected_accounts.join(', ') 
                : r.project || r.source_account || '';
            return [formatPdfStr(riskMsg), formatPdfStr(sev).toUpperCase(), formatPdfStr(desc), formatPdfStr(affected)];
        });
        addTableSection('Critical Risks', headers, rows);
    }
    
    // 5. Opportunities Table
    if (Array.isArray(parsedInsights.opportunities) && parsedInsights.opportunities.length > 0) {
        const headers = ['Opportunity', 'Priority/Impact', 'Description', 'Affected Entity/Project'];
        const rows = parsedInsights.opportunities.map((o: any) => {
            const optMsg = o.opportunity || o.message || o.type || '';
            const imp = o.level || o.impact || o.priority || 'High';
            const desc = o.description || o.expected_outcome || o.expected_business_outcome || '';
            const affected = Array.isArray(o.affected_accounts) 
                ? o.affected_accounts.join(', ') 
                : o.project || '';
            return [formatPdfStr(optMsg), formatPdfStr(imp).toUpperCase(), formatPdfStr(desc), formatPdfStr(affected)];
        });
        addTableSection('Strategic Opportunities', headers, rows);
    }
    
    // 6. Capability Alignment Table
    if (Array.isArray(parsedInsights.capability_alignment) && parsedInsights.capability_alignment.length > 0) {
        const headers = ['Identified Gap', 'Relevant Capability', 'Solution Approach', 'Expected ROI'];
        const rows = parsedInsights.capability_alignment.map((cap: any) => {
            const gap = cap.gap || cap.identified_gap || cap.gap_type || '';
            const capability = cap.relevant_capability || cap.capability || '';
            const solution = cap.solution_approach || cap.solution || '';
            const roi = cap.roi || '';
            return [formatPdfStr(gap), formatPdfStr(capability), formatPdfStr(solution), formatPdfStr(roi)];
        });
        addTableSection('Capability Alignment Analysis', headers, rows);
    }
    
    // 7. Strategic Gaps Table
    if (Array.isArray(parsedInsights.strategic_gaps) && parsedInsights.strategic_gaps.length > 0) {
        const headers = ['Identified Gap', 'Description', 'Affected Accounts', 'Severity'];
        const rows = parsedInsights.strategic_gaps.map((gap: any) => {
            const title = gap.gap_type || gap.title || gap.name || '';
            const desc = gap.description || gap.desc || gap.text || '';
            const affected = Array.isArray(gap.affected_accounts) 
                ? gap.affected_accounts.join(', ') 
                : gap.project || '';
            const severity = gap.severity || gap.impact || 'medium';
            return [formatPdfStr(title), formatPdfStr(desc), formatPdfStr(affected), formatPdfStr(severity).toUpperCase()];
        });
        addTableSection('Strategic Gaps Analysis', headers, rows);
    }
    
    // 8. Recommendations Table
    const recs = parsedInsights.strategic_recommendations || parsedInsights.recommended_actions || parsedInsights.recommendations;
    if (Array.isArray(recs) && recs.length > 0) {
        const headers = ['#', 'Recommendation', 'Priority', 'Rationale', 'Expected Outcome'];
        const rows = recs.map((rec: any, idx: number) => {
            let recommendationText = '';
            let priority = 'Medium';
            let rationale = '';
            let outcome = '';
            
            if (typeof rec === 'string') {
                recommendationText = rec;
            } else if (typeof rec === 'object' && rec !== null) {
                recommendationText = rec.recommendation || rec.text || rec.description || '';
                priority = rec.priority || 'Medium';
                rationale = rec.rationale || '';
                outcome = rec.expected_business_outcome || rec.expected_outcome || rec.outcome || '';
            }
            return [idx + 1, formatPdfStr(recommendationText), formatPdfStr(priority).toUpperCase(), formatPdfStr(rationale), formatPdfStr(outcome)];
        });
        addTableSection('Strategic Recommendations', headers, rows, {
            0: { cellWidth: 8 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20 },
            3: { cellWidth: 50 },
            4: { cellWidth: 44 }
        });
    }
    
    // Helper to add bullet point sections
    const addBulletListSection = (title: string, items: any[]) => {
        if (!Array.isArray(items) || items.length === 0) return;
        
        if (currentY > pageHeight - 30) {
            doc.addPage();
            currentY = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        
        items.forEach((item) => {
            const text = getInsightItemText(item);
            const listLines = doc.splitTextToSize(`•  ${formatPdfStr(text)}`, pageWidth - 28);
            if (currentY + listLines.length * 4.5 > pageHeight - 15) {
                doc.addPage();
                currentY = 20;
            }
            doc.text(listLines, 14, currentY);
            currentY += listLines.length * 4.5 + 2;
        });
        currentY += 4;
    };
    
    // 9. Leadership Pitches
    if (Array.isArray(parsedInsights.leadership_pitch) && parsedInsights.leadership_pitch.length > 0) {
        addBulletListSection('Leadership Pitches', parsedInsights.leadership_pitch);
    }
    
    // 10. Categorized Insights Sections
    if (Array.isArray(parsedInsights.portfolio_insights) && parsedInsights.portfolio_insights.length > 0) {
        addBulletListSection('Portfolio Insights', parsedInsights.portfolio_insights);
    }
    
    if (Array.isArray(parsedInsights.financial_insights) && parsedInsights.financial_insights.length > 0) {
        addBulletListSection('Financial Insights', parsedInsights.financial_insights);
    }
    
    if (Array.isArray(parsedInsights.delivery_insights) && parsedInsights.delivery_insights.length > 0) {
        addBulletListSection('Delivery & Operational Insights', parsedInsights.delivery_insights);
    }
    
    if (Array.isArray(parsedInsights.ai_insights) && parsedInsights.ai_insights.length > 0) {
        addBulletListSection('AI Maturity Insights', parsedInsights.ai_insights);
    }
    
    if (Array.isArray(parsedInsights.engineering_insights) && parsedInsights.engineering_insights.length > 0) {
        addBulletListSection('Engineering & Technical Insights', parsedInsights.engineering_insights);
    }
    
    if (Array.isArray(parsedInsights.governance_insights) && parsedInsights.governance_insights.length > 0) {
        addBulletListSection('Governance Insights', parsedInsights.governance_insights);
    }
    
    if (Array.isArray(parsedInsights.timeline_insights) && parsedInsights.timeline_insights.length > 0) {
        addBulletListSection('Timeline & Delivery Health', parsedInsights.timeline_insights);
    }
    
    // Add Footer with Page Numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'Project Insighter',
            14,
            pageHeight - 10
        );
    }
    
    doc.save(`${entityName.replace(/\s+/g, '_')}_Strategic_Insights.pdf`);
};
