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
exports.RiskService = void 0;
var calculator_1 = require("../risk/calculator");
var explainability_service_1 = require("./explainability.service");
var RiskService = /** @class */ (function () {
    function RiskService(db) {
        this.db = db;
        this.explainabilityService = new explainability_service_1.ExplainabilityService();
    }
    /**
     * Calculate risk for one junction with explanation
     */
    RiskService.prototype.calculateJunctionRiskWithExplanation = function (junctionId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, junction, inputs, calculation, explanation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("SELECT \n        id,\n        name,\n        historical_severity_score,\n        congestion,\n        violations,\n        obstructions,\n        weather_risk,\n        event_pressure,\n        incident_severity\n      FROM junctions\n      WHERE id = $1", [junctionId])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Junction ".concat(junctionId, " not found"));
                        }
                        junction = result.rows[0];
                        inputs = {
                            accidentHistory: (0, calculator_1.normalizeHistoricalScore)(junction.historical_severity_score),
                            congestion: junction.congestion || 0,
                            violations: junction.violations || 0,
                            obstructions: junction.obstructions || 0,
                            weather: junction.weather_risk || 0,
                            events: junction.event_pressure || 0,
                            incidents: junction.incident_severity || 0,
                        };
                        calculation = (0, calculator_1.calculateRiskScore)(inputs);
                        explanation = this.explainabilityService.generateExplanation(junction.name, calculation);
                        // Update database
                        return [4 /*yield*/, this.db.query("UPDATE junctions\n       SET current_risk_score = $1,\n           risk_level = $2,\n           updated_at = CURRENT_TIMESTAMP\n       WHERE id = $3", [calculation.score, calculation.level, junctionId])];
                    case 2:
                        // Update database
                        _a.sent();
                        return [2 /*return*/, {
                                junctionId: junction.id,
                                junctionName: junction.name,
                                score: calculation.score,
                                level: calculation.level,
                                explanation: explanation,
                            }];
                }
            });
        });
    };
    /**
     * Get explanation for a junction (without recalculating)
     */
    RiskService.prototype.getJunctionExplanation = function (junctionId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, junction, inputs, calculation, explanation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.query("SELECT \n        id,\n        name,\n        current_risk_score,\n        risk_level,\n        historical_severity_score,\n        congestion,\n        violations,\n        obstructions,\n        weather_risk,\n        event_pressure,\n        incident_severity\n      FROM junctions\n      WHERE id = $1", [junctionId])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            throw new Error("Junction ".concat(junctionId, " not found"));
                        }
                        junction = result.rows[0];
                        inputs = {
                            accidentHistory: (0, calculator_1.normalizeHistoricalScore)(junction.historical_severity_score),
                            congestion: junction.congestion || 0,
                            violations: junction.violations || 0,
                            obstructions: junction.obstructions || 0,
                            weather: junction.weather_risk || 0,
                            events: junction.event_pressure || 0,
                            incidents: junction.incident_severity || 0,
                        };
                        calculation = (0, calculator_1.calculateRiskScore)(inputs);
                        explanation = this.explainabilityService.generateExplanation(junction.name, calculation);
                        return [2 /*return*/, {
                                junctionId: junction.id,
                                junctionName: junction.name,
                                score: calculation.score,
                                level: calculation.level,
                                explanation: explanation,
                            }];
                }
            });
        });
    };
    return RiskService;
}());
exports.RiskService = RiskService;
