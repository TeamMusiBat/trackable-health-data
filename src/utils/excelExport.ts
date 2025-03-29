
import { Workbook, Worksheet } from 'xlsx';
import * as XLSX from 'xlsx';
import { ChildScreeningData, AwarenessSessionData } from '@/lib/types';

// Apply styling to Excel headers
const applyHeaderStyle = (worksheet: Worksheet): void => {
  // Get column range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colCount = range.e.c + 1;
  
  // Apply style to first row (header)
  for (let col = 0; col < colCount; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (!cell) continue;
    
    // Create formatting object if it doesn't exist
    if (!cell.s) cell.s = {};
    
    // Apply bold, center alignment, fill color
    cell.s = {
      ...cell.s,
      font: { bold: true },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: 'E1E1E1' } },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
    };
  }
};

// Apply MUAC-based color coding for child screening data
const applyMuacFormatting = (worksheet: Worksheet, dataRows: ChildScreeningData[]): void => {
  // Get column range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  // Find MUAC column index
  let muacColIndex = -1;
  for (let col = 0; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]?.v === 'MUAC') {
      muacColIndex = col;
      break;
    }
  }
  
  if (muacColIndex === -1) return; // MUAC column not found
  
  // Apply color based on MUAC value
  dataRows.forEach((row, idx) => {
    const rowIndex = idx + 1; // +1 to skip header row
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: muacColIndex });
    const cell = worksheet[cellAddress];
    if (!cell) return;
    
    // Create or get existing style object
    if (!cell.s) cell.s = {};
    
    // Apply color based on MUAC value
    if (row.muac <= 11) { // SAM
      cell.s.fill = { fgColor: { rgb: 'FF9999' } }; // Light red for SAM
    } else if (row.muac <= 12) { // MAM
      cell.s.fill = { fgColor: { rgb: 'FFCC99' } }; // Light orange for MAM
    } else { // Normal
      cell.s.fill = { fgColor: { rgb: 'CCFFCC' } }; // Light green for normal
    }
  });
};

// Set column widths based on content
const setColumnWidths = (worksheet: Worksheet): void => {
  // Get column range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colCount = range.e.c + 1;
  const rowCount = range.e.r + 1;
  
  // Initialize column width array
  const colWidths: number[] = Array(colCount).fill(10); // Default width
  
  // Check all cells for content length
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (!cell || !cell.v) continue;
      
      // Get string length
      const cellValue = String(cell.v);
      const cellWidth = cellValue.length + 2; // +2 for padding
      
      // Update column width if this cell is wider
      colWidths[col] = Math.max(colWidths[col], cellWidth);
    }
  }
  
  // Set column widths (max width is 40)
  colWidths.forEach((width, idx) => {
    const colName = XLSX.utils.encode_col(idx);
    worksheet['!cols'] = worksheet['!cols'] || [];
    worksheet['!cols'][idx] = { wch: Math.min(width, 40) };
  });
  
  // Enable text wrapping for all data cells
  for (let row = 1; row < rowCount; row++) { // Skip header
    for (let col = 0; col < colCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (!cell) continue;
      
      // Create style object if it doesn't exist
      if (!cell.s) cell.s = {};
      
      // Enable text wrapping
      cell.s.alignment = { ...(cell.s.alignment || {}), wrapText: true };
    }
  }
};

// Add title to worksheet
const addTitle = (worksheet: Worksheet, title: string): void => {
  // Get column range
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  const colCount = range.e.c + 1;
  
  // Shift all existing cells down by 2 rows
  const newWorksheet: Record<string, any> = {};
  for (const cellAddress in worksheet) {
    if (cellAddress.startsWith('!')) {
      newWorksheet[cellAddress] = worksheet[cellAddress];
      continue;
    }
    
    const cell = worksheet[cellAddress];
    const cellRef = XLSX.utils.decode_cell(cellAddress);
    const newCellAddress = XLSX.utils.encode_cell({ r: cellRef.r + 2, c: cellRef.c });
    newWorksheet[newCellAddress] = cell;
  }
  
  // Update range
  if (range.e.r >= 0) {
    newWorksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: range.e.r + 2, c: range.e.c }
    });
  }
  
  // Copy column widths
  if (worksheet['!cols']) {
    newWorksheet['!cols'] = worksheet['!cols'];
  }
  
  // Add title cell
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  newWorksheet[titleCell] = { 
    v: title, 
    t: 's',
    s: {
      font: { bold: true, sz: 16 },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };
  
  // Merge cells for title
  if (!newWorksheet['!merges']) newWorksheet['!merges'] = [];
  newWorksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } });
  
  // Replace worksheet with new one
  Object.assign(worksheet, newWorksheet);
};

// Export child screening data to Excel
export const exportChildScreeningToExcel = (
  data: ChildScreeningData[],
  options: {
    fileName?: string;
    filterSam?: boolean;
    filterMam?: boolean;
    workerSplit?: boolean;
    title?: string;
  } = {}
): void => {
  // Apply filters
  let filteredData = [...data];
  
  if (options.filterSam && !options.filterMam) {
    filteredData = filteredData.filter(item => item.muac <= 11);
  } else if (options.filterMam && !options.filterSam) {
    filteredData = filteredData.filter(item => item.muac > 11 && item.muac <= 12);
  } else if (options.filterSam && options.filterMam) {
    filteredData = filteredData.filter(item => item.muac <= 12);
  }
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  if (options.workerSplit) {
    // Group by user ID
    const userGroups: Record<string, ChildScreeningData[]> = {};
    filteredData.forEach(item => {
      if (!userGroups[item.userId]) {
        userGroups[item.userId] = [];
      }
      userGroups[item.userId].push(item);
    });
    
    // Create sheet for each user
    Object.entries(userGroups).forEach(([userId, userData]) => {
      const sheetData = userData.map(item => ({
        'Serial No': item.serialNo,
        'Date': new Date(item.date).toLocaleDateString(),
        'Child Name': item.name,
        'Father Name': item.father,
        'Age (months)': item.age,
        'MUAC': item.muac,
        'Gender': item.gender,
        'District': item.district,
        'Union Council': item.unionCouncil,
        'Village': item.village,
        'Vaccination': item.vaccination,
        'Due Vaccine': item.dueVaccine ? 'Yes' : 'No',
        'Remarks': item.remarks
      }));
      
      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(sheetData);
      
      // Apply formatting
      applyHeaderStyle(ws);
      applyMuacFormatting(ws, userData);
      setColumnWidths(ws);
      
      // Add title
      const title = options.title || `Field Worker ${userId} - Child Screening Data`;
      addTitle(ws, title);
      
      // Add to workbook
      XLSX.utils.book_append_sheet(wb, ws, `Worker ${userId}`);
    });
  } else {
    // Create single sheet with all data
    const sheetData = filteredData.map(item => ({
      'Serial No': item.serialNo,
      'Date': new Date(item.date).toLocaleDateString(),
      'Child Name': item.name,
      'Father Name': item.father,
      'Age (months)': item.age,
      'MUAC': item.muac,
      'Gender': item.gender,
      'District': item.district,
      'Union Council': item.unionCouncil,
      'Village': item.village,
      'Vaccination': item.vaccination,
      'Due Vaccine': item.dueVaccine ? 'Yes' : 'No',
      'Remarks': item.remarks,
      'Worker ID': item.userId
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sheetData);
    
    // Apply formatting
    applyHeaderStyle(ws);
    applyMuacFormatting(ws, filteredData);
    setColumnWidths(ws);
    
    // Add title
    const title = options.title || 'Child Screening Data';
    addTitle(ws, title);
    
    // Add to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Child Screening');
  }
  
  // Generate filename
  const fileType = options.filterSam && options.filterMam ? 'SAM-MAM' : 
                  options.filterSam ? 'SAM' : 
                  options.filterMam ? 'MAM' : 'All';
  
  const fileName = options.fileName || 
    `child-screening-${fileType}-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Export workbook
  XLSX.writeFile(wb, fileName);
};

// Export awareness session data to Excel
export const exportAwarenessSessionToExcel = (
  data: AwarenessSessionData[],
  options: {
    fileName?: string;
    title?: string;
    type?: 'FMT' | 'Social Mobilizers';
  } = {}
): void => {
  // Filter by type if needed
  const filteredData = options.type ? data.filter(item => item.type === options.type) : data;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Create single sheet with all data
  const sheetData = filteredData.map(item => ({
    'Serial No': item.serialNo,
    'Date': new Date(item.date).toLocaleDateString(),
    'Name': item.name,
    'Father/Husband': item.fatherOrHusband,
    'Age': item.age,
    'Under Five Children': item.underFiveChildren,
    'Village': item.villageName,
    'Union Council': item.ucName,
    'Contact Number': item.contactNumber,
    'Type': item.type,
    'Worker ID': item.userId
  }));
  
  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(sheetData);
  
  // Apply formatting
  applyHeaderStyle(ws);
  setColumnWidths(ws);
  
  // Add title
  const sessionType = options.type || 'All';
  const title = options.title || `${sessionType} Awareness Sessions`;
  addTitle(ws, title);
  
  // Add to workbook
  const sheetName = options.type || 'Awareness';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate filename
  const fileName = options.fileName || 
    `awareness-sessions-${options.type || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Export workbook
  XLSX.writeFile(wb, fileName);
};
