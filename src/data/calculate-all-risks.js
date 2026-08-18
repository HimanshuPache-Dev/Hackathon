"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExcelJS = require("exceljs");
var path = require("path");
var calculator_1 = require("../risk/calculator");
var explainability_service_1 = require("../services/explainability.service");
function calculateAllRisks() {
    return __awaiter(this, void 0, void 0, function () {
        var workbook, filePath, worksheet, headers, junctions, _loop_1, rowNum, explainabilityService, results, _i, junctions_1, junction, inputs, calculation, explanation, byLevel, fs, outputPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    workbook = new ExcelJS.Workbook();
                    filePath = path.join(__dirname, '../../../data/nagpur20junctionsriskdataset.xlsx');
                    console.log('Loading Excel file...');
                    return [4 /*yield*/, workbook.xlsx.readFile(filePath)];
                case 1:
                    _a.sent();
                    worksheet = workbook.getWorksheet('Junctions_20');
                    if (!worksheet) {
                        console.error('Junctions_20 sheet not found!');
                        return [2 /*return*/];
                    }
                    headers = [];
                    worksheet.getRow(1).eachCell(function (cell) {
                        headers.push(String(cell.value || ''));
                    });
                    junctions = [];
                    _loop_1 = function (rowNum) {
                        var row = worksheet.getRow(rowNum);
                        var rowData = {};
                        headers.forEach(function (header, index) {
                            var cell = row.getCell(index + 1);
                            if (typeof cell.value === 'object' && cell.value !== null && 'result' in cell.value) {
                                rowData[header] = cell.value.result;
                            }
                            else {
                                rowData[header] = cell.value;
                            }
                        });
                        junctions.push(rowData);
                    };
                    for (rowNum = 2; rowNum <= worksheet.rowCount; rowNum++) {
                        _loop_1(rowNum);
                    }
                    console.log("Loaded ".concat(junctions.length, " junctions\n"));
                    explainabilityService = new explainability_service_1.ExplainabilityService();
                    console.log('=== RISK CALCULATION RESULTS ===\n');
                    results = [];
                    for (_i = 0, junctions_1 = junctions; _i < junctions_1.length; _i++) {
                        junction = junctions_1[_i];
                        inputs = {
                            accidentHistory: (0, calculator_1.normalizeHistoricalScore)(junction.Relative_Risk_Score_0_100 || 0),
                            congestion: 0.5, // Simulated - will be updated later
                            violations: 0.3, // Simulated
                            obstructions: 0.2, // Simulated
                            weather: 0.4, // Simulated
                            events: 0.2, // Simulated
                            incidents: 0.0, // No current incident
                        };
                        calculation = (0, calculator_1.calculateRiskScore)(inputs);
                        explanation = explainabilityService.generateExplanation(junction.Location_Name, calculation);
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
                        console.log("".concat(junction.Junction_ID, ": ").concat(junction.Location_Name));
                        console.log("  Historical: ".concat(junction.Relative_Risk_Score_0_100, " (").concat(junction.Historical_Priority_Tier, ")"));
                        console.log("  Current: ".concat(calculation.score, " (").concat(calculation.level, ")"));
                        console.log("  Top Factors: ".concat(explanation.topFactors.join(', ')));
                        console.log('');
                    }
                    // Summary by risk level
                    console.log('=== SUMMARY BY RISK LEVEL ===');
                    byLevel = results.reduce(function (acc, r) {
                        acc[r.currentLevel] = (acc[r.currentLevel] || 0) + 1;
                        return acc;
                    }, {});
                    Object.entries(byLevel).forEach(function (_a) {
                        var level = _a[0], count = _a[1];
                        console.log("".concat(level, ": ").concat(count, " junctions"));
                    });
                    fs = require('fs');
                    outputPath = path.join(__dirname, '../../../data/junctions-with-risks.json');
                    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
                    console.log("\nSaved to: ".concat(outputPath));
                    return [2 /*return*/];
            }
        });
    });
}
calculateAllRisks().catch(console.error);
