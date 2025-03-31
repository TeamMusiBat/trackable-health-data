
import * as XLSX from 'xlsx';
import { ChildScreeningData, AwarenessSessionData, ExportOptions } from '@/lib/types';

// Helper function to convert date to Pakistani time
const toPakistaniTime = (date: Date | string): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Pakistan is UTC+5
  const pakistaniTime = new Date(dateObj.getTime() + (5 * 60 * 60 * 1000));
  
  // Format as DD/MM/YYYY HH:MM
  return `${pakistaniTime.getDate().toString().padStart(2, '0')}/${
    (pakistaniTime.getMonth() + 1).toString().padStart(2, '0')}/${
    pakistaniTime.getFullYear()} ${
    pakistaniTime.getHours().toString().padStart(2, '0')}:${
    pakistaniTime.getMinutes().toString().padStart(2, '0')}`;
};

// Helper function to get nutrition status based on MUAC
const getNutritionStatus = (muac: number): string => {
  if (muac <= 11) return 'SAM';
  if (muac <= 12) return 'MAM';
  return 'Normal';
};

// Helper function to remove duplicates based on name, father, and village
const removeDuplicates = <T extends ChildScreeningData | AwarenessSessionData>(
  data: T[]
): T[] => {
  const uniqueMap = new Map();
  
  return data.filter(item => {
    // For child screening data
    if ('father' in item) {
      const key = `${item.name}|${item.father}|${item.village}`;
      if (uniqueMap.has(key)) return false;
      uniqueMap.set(key, true);
      return true;
    }
    
    // For awareness session data
    if ('fatherOrHusband' in item) {
      const key = `${item.name}|${item.fatherOrHusband}|${item.villageName}`;
      if (uniqueMap.has(key)) return false;
      uniqueMap.set(key, true);
      return true;
    }
    
    return true;
  });
};

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const exportChildScreening = (data: ChildScreeningData[], options: ExportOptions = {}) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  let exportData = [...data];
  
  // Apply filters
  if (options.filterSam) {
    exportData = exportData.filter(child => child.muac <= 11);
  }
  else if (options.filterMam) {
    exportData = exportData.filter(child => child.muac > 11 && child.muac <= 12);
  }
  
  // Remove duplicates if requested
  if (options.removeDuplicates) {
    exportData = removeDuplicates(exportData);
  }
  
  if (exportData.length === 0) {
    alert('No data matches the selected filters');
    return;
  }
  
  // Extract worker ID from the first entry if needed
  const workerId = exportData[0]?.userId || 'unknown';
  
  // Transform data for export
  const formattedData = exportData.map(child => {
    const nutritionStatus = getNutritionStatus(child.muac);
    
    const row: any = {
      'Name': capitalizeWords(child.name),
      'Father Name': capitalizeWords(child.father),
      'Age': child.age,
      'Gender': child.gender,
      'MUAC': child.muac,
      'District': child.district,
      'UC': child.unionCouncil,
      'Village': child.village,
      'Vaccination': child.vaccination,
      'Due Vaccine': child.dueVaccine ? 'Yes' : 'No',
      'Remarks': child.remarks || nutritionStatus,
      'Date': options.pakistaniTime 
        ? toPakistaniTime(child.date)
        : new Date(child.date).toLocaleString(),
    };
    
    // Include additional fields based on options
    if (!options.removeWorkerId) {
      row['Worker ID'] = child.userId;
    }
    
    if (options.includeImages && !options.removeImagesColumn) {
      row['Images'] = child.images?.length || 0;
    }
    
    return row;
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formattedData, { header: Object.keys(formattedData[0]) });
  
  // Set title
  const title = options.title || 'Child Screening Data';
  
  // Set column widths and apply styling
  const colWidths = [
    { wch: 20 }, // Name
    { wch: 20 }, // Father
    { wch: 8 },  // Age
    { wch: 10 }, // Gender
    { wch: 8 },  // MUAC
    { wch: 15 }, // District
    { wch: 20 }, // UC
    { wch: 25 }, // Village
    { wch: 15 }, // Vaccination
    { wch: 12 }, // Due Vaccine
    { wch: 15 }, // Remarks
    { wch: 20 }, // Date
  ];
  
  if (!options.removeWorkerId) {
    colWidths.push({ wch: 20 }); // Worker ID
  }
  
  if (options.includeImages && !options.removeImagesColumn) {
    colWidths.push({ wch: 10 }); // Images
  }
  
  ws['!cols'] = colWidths;
  
  // Style the sheet (using merge cells for title)
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(formattedData[0]).length - 1 } }];
  
  // Insert title row at the top and merge cells
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
  
  // Apply MUAC-based formatting (R=SAM, Y=MAM, G=Normal)
  for (let i = 0; i < formattedData.length; i++) {
    const rowIndex = i + 2; // +2 because of title row and header row
    const muacValue = exportData[i]?.muac;
    
    // Set the fill color based on MUAC value
    if (muacValue <= 11) { // SAM - Red
      ws[`E${rowIndex}`] = { v: muacValue, s: { fill: { fgColor: { rgb: 'FFFF0000' } } } };
      ws[`K${rowIndex}`] = { v: 'SAM', s: { fill: { fgColor: { rgb: 'FFFF0000' } } } };
    } else if (muacValue <= 12) { // MAM - Yellow
      ws[`E${rowIndex}`] = { v: muacValue, s: { fill: { fgColor: { rgb: 'FFFFFF00' } } } };
      ws[`K${rowIndex}`] = { v: 'MAM', s: { fill: { fgColor: { rgb: 'FFFFFF00' } } } };
    } else { // Normal - Green
      ws[`E${rowIndex}`] = { v: muacValue, s: { fill: { fgColor: { rgb: 'FF00FF00' } } } };
      ws[`K${rowIndex}`] = { v: 'Normal', s: { fill: { fgColor: { rgb: 'FF00FF00' } } } };
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Child Screening');
  
  // Format the filename to include date and filter info
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  let filename = `Child_Screening_${dateStr}`;
  if (options.filterSam) filename += '_SAM';
  if (options.filterMam) filename += '_MAM';
  if (!options.workerSplit) filename += `_Worker-${workerId}`;
  
  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportAwarenessSessions = (
  data: AwarenessSessionData[], 
  type: string, 
  options: ExportOptions = {}
) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  let exportData = [...data];
  
  // Remove duplicates if requested
  if (options.removeDuplicates) {
    exportData = removeDuplicates(exportData);
  }
  
  if (exportData.length === 0) {
    alert('No data matches the selected filters');
    return;
  }
  
  // Extract worker ID from the first entry if needed
  const workerId = exportData[0]?.userId || 'unknown';
  
  // Transform data for export
  const formattedData = exportData.map(session => {
    const row: any = {
      'Session Number': session.sessionNumber || 1,
      'Name': capitalizeWords(session.name),
      'Father/Husband': capitalizeWords(session.fatherOrHusband),
      'Age': session.age,
      'Under 5 Children': session.underFiveChildren,
      'Village': session.villageName,
      'UC': session.ucName,
      'Same UC': session.sameUc ? 'Yes' : 'No',
      'Alternate Location': session.alternateLocation || '',
      'Contact': session.contactNumber || '',
      'Date': options.pakistaniTime 
        ? toPakistaniTime(session.date)
        : new Date(session.date).toLocaleString(),
    };
    
    // Include additional fields based on options
    if (!options.removeWorkerId) {
      row['Worker ID'] = session.userId;
    }
    
    if (options.includeImages && !options.removeImagesColumn) {
      row['Images'] = session.images?.length || 0;
    }
    
    // Add location coordinates if available
    if (session.locationCoords) {
      row['GPS Coordinates'] = `${session.locationCoords.latitude.toFixed(6)}, ${session.locationCoords.longitude.toFixed(6)}`;
    }
    
    return row;
  });
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formattedData, { header: Object.keys(formattedData[0]) });
  
  // Set title
  const title = options.title || `${type === 'fmt' ? 'FMT' : 'Social Mobilizers'} Awareness Sessions`;
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // Session Number
    { wch: 20 }, // Name
    { wch: 20 }, // Father/Husband
    { wch: 8 },  // Age
    { wch: 15 }, // Under 5
    { wch: 25 }, // Village
    { wch: 20 }, // UC
    { wch: 10 }, // Same UC
    { wch: 25 }, // Alternate Location
    { wch: 15 }, // Contact
    { wch: 20 }, // Date
  ];
  
  if (!options.removeWorkerId) {
    colWidths.push({ wch: 20 }); // Worker ID
  }
  
  if (options.includeImages && !options.removeImagesColumn) {
    colWidths.push({ wch: 10 }); // Images
  }
  
  // Add GPS coordinates column width if any entry has coordinates
  if (exportData.some(session => session.locationCoords)) {
    colWidths.push({ wch: 25 }); // GPS Coordinates
  }
  
  ws['!cols'] = colWidths;
  
  // Style the sheet (using merge cells for title)
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Object.keys(formattedData[0]).length - 1 } }];
  
  // Insert title row at the top and merge cells
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Awareness Sessions');
  
  // Format the filename
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  let filename = `${type === 'fmt' ? 'FMT' : 'SM'}_Awareness_Sessions_${dateStr}`;
  if (!options.workerSplit) filename += `_Worker-${workerId}`;
  
  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
