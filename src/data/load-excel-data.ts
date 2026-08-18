import * as ExcelJS from 'exceljs';
import * as path from 'path';

async function loadExcelData() {
  const workbook = new ExcelJS.Workbook();
  
  const filePath = path.join(
    __dirname,
    '../../../data/nagpur20junctionsriskdataset.xlsx'
  );
  
  console.log('Loading Excel file from:', filePath);
  
  await workbook.xlsx.readFile(filePath);
  
  // List all worksheets
  console.log('=== All Worksheets ===');
  workbook.eachSheet((sheet, sheetId) => {
    console.log(`Sheet ${sheetId}: ${sheet.name} (${sheet.rowCount} rows)`);
  });
  console.log('');
  
  // Use the Junctions_20 sheet
  const dataSheetName = 'Junctions_20';
  
  console.log('Using sheet:', dataSheetName);
  const worksheet = workbook.getWorksheet(dataSheetName);
  
  if (!worksheet) {
    console.error('Worksheet not found!');
    return;
  }
  
  console.log('Row count:', worksheet.rowCount);
  
  // Read headers
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value || '');
  });
  
  console.log('Headers:', headers);
  console.log('');
  
  // Read first 5 rows as example
  console.log('=== First 5 Junctions ===');
  for (let rowNum = 2; rowNum <= 6 && rowNum <= worksheet.rowCount!; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      rowData[header] = row.getCell(index + 1).value;
    });
    
    console.log(`Row ${rowNum}:`, rowData);
    console.log('');
  }
}

loadExcelData().catch(console.error);