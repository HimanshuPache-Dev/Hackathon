"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var calculator_1 = require("../calculator");
describe('Risk Calculator', function () {
    test('calculates correct score', function () {
        var inputs = {
            accidentHistory: 0.85,
            congestion: 0.90,
            violations: 0.60,
            obstructions: 0.40,
            weather: 0.40,
            events: 0.30,
            incidents: 0.87,
        };
        var result = (0, calculator_1.calculateRiskScore)(inputs);
        expect(result.score).toBe(73.2);
        expect(result.level).toBe('HIGH');
    });
    test('determines CRITICAL level', function () {
        expect((0, calculator_1.determineRiskLevel)(85)).toBe('CRITICAL');
    });
    test('normalizes historical score', function () {
        expect((0, calculator_1.normalizeHistoricalScore)(85)).toBe(0.85);
    });
});
