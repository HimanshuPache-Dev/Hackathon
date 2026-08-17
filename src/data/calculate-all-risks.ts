import * as ExcelJS from 'exceljs';
import * as path from 'path';
import { calculateRiskScore, normalizeHistoricalScore } from '../risk/calculator';
import { ExplainabilityService } from '../services/explainability.service';

async function calculateAllRisks() {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.join(__dirname, '../../../data/nagpur20junctionsriskdataset.xlsx');
  
  console.log('Loading Excel file...');
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet('Junctions_20');
  if (!worksheet) {
    console.error('Junctions_20 sheet not found!');
    return;
  }
  
  // Read headers
  const headers: string[] = [];
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(String(cell.value || ''));
  });
  
  // Read all junctions
  const junctions: any[] = [];
  for (let rowNum = 2; rowNum <= worksheet.rowCount!; rowNum++) {
    const row = worksheet.getRow(rowNum);
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      const cell = row.getCell(index + 1);
      if (typeof cell.value === 'object' && cell.value !== null && 'result' in cell.value) {
        rowData[header] = cell.value.result;
      } else {
        rowData[header] = cell.value;
      }
    });
    
    junctions.push(rowData);
  }
  
  console.log(`Loaded ${junctions.length} junctions\n`);
  
  // Calculate risk for each junction
  const explainabilityService = new ExplainabilityService();
  
  console.log('=== RISK CALCULATION RESULTS ===\n');
  
  const results: any[] = [];
  
  for (const junction of junctions) {
    const inputs = {
      accidentHistory: normalizeHistoricalScore(junction.Relative_Risk_Score_0_100 || 0),
      congestion: 0.5, // Simulated - will be updated later
      violations: 0.3, // Simulated
      obstructions: 0.2, // Simulated
      weather: 0.4, // Simulated
      events: 0.2, // Simulated
      incidents: 0.0, // No current incident
    };
    
    const calculation = calculateRiskScore(inputs);
    const explanation = explainabilityService.generateExplanation(
      junction.Location_Name,
      calculation
    );
    
    results.push({
      junctionId: junction.Junction_ID,
      name: junction.Location_Name,
      latitude: junction.Latitude,
      longitude: junction.Longitude,
      historicalScore: junction.Relative_Risk_Score_0_100,
      historicalTier: junction.Historical_Priority_Tier,
      currentScore: calculation.score,
      currentLevel: calculation.level,
      explanation: explanation.summary,
    });
    
    console.log(`${junction.Junction_ID}: ${junction.Location_Name}`);
    console.log(`  Historical: ${junction.Relative_Risk_Score_0_100} (${junction.Historical_Priority_Tier})`);
    console.log(`  Current: ${calculation.score} (${calculation.level})`);
    console.log(`  Top Factors: ${explanation.topFactors.join(', ')}`);
    console.log('');
  }
  
  // Summary by risk level
  console.log('=== SUMMARY BY RISK LEVEL ===');
  const byLevel = results.reduce((acc, r) => {
    acc[r.currentLevel] = (acc[r.currentLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(byLevel).forEach(([level, count]) => {
    console.log(`${level}: ${count} junctions`);
  });
  
  // Save to JSON
  const fs = require('fs');
  const outputPath = path.join(__dirname, '../../../data/junctions-with-risks.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved to: ${outputPath}`);
}

calculateAllRisks().catch(console.error);