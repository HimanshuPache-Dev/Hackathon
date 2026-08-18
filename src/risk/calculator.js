"use strict";
// Remove the import
// import { RiskLevel } from '../../shared/types';
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRiskScore = calculateRiskScore;
exports.determineRiskLevel = determineRiskLevel;
exports.normalizeHistoricalScore = normalizeHistoricalScore;
/**
 * Calculate risk score for a junction
 * @param inputs - Risk factor inputs (all normalized to 0-1)
 * @returns Risk score (0-100), level, and factor breakdown
 */
function calculateRiskScore(inputs) {
    // Weights from the workbook
    var WEIGHTS = {
        accidentHistory: 0.30,
        congestion: 0.25,
        violations: 0.15,
        obstructions: 0.10,
        weather: 0.05,
        events: 0.05,
        incidents: 0.10,
    };
    // Calculate weighted contributions
    var contributions = {
        accidentHistory: inputs.accidentHistory * WEIGHTS.accidentHistory * 100,
        congestion: inputs.congestion * WEIGHTS.congestion * 100,
        violations: inputs.violations * WEIGHTS.violations * 100,
        obstructions: inputs.obstructions * WEIGHTS.obstructions * 100,
        weather: inputs.weather * WEIGHTS.weather * 100,
        events: inputs.events * WEIGHTS.events * 100,
        incidents: inputs.incidents * WEIGHTS.incidents * 100,
    };
    // Sum all contributions
    var rawScore = contributions.accidentHistory +
        contributions.congestion +
        contributions.violations +
        contributions.obstructions +
        contributions.weather +
        contributions.events +
        contributions.incidents;
    // Clamp score to 0-100 range
    var score = Math.min(100, Math.max(0, rawScore));
    // Determine risk level
    var level = determineRiskLevel(score);
    // Create breakdown for explainability
    var breakdown = [
        {
            code: 'A', // ✅ CORRECT
            name: 'Accident History',
            value: inputs.accidentHistory,
            weight: WEIGHTS.accidentHistory,
            contribution: contributions.accidentHistory,
        },
        {
            code: 'C',
            name: 'Congestion',
            value: inputs.congestion,
            weight: WEIGHTS.congestion,
            contribution: contributions.congestion,
        },
        {
            code: 'V',
            name: 'Violations',
            value: inputs.violations,
            weight: WEIGHTS.violations,
            contribution: contributions.violations,
        },
        {
            code: 'O',
            name: 'Obstructions',
            value: inputs.obstructions,
            weight: WEIGHTS.obstructions,
            contribution: contributions.obstructions,
        },
        {
            code: 'W',
            name: 'Weather',
            value: inputs.weather,
            weight: WEIGHTS.weather,
            contribution: contributions.weather,
        },
        {
            code: 'E',
            name: 'Events',
            value: inputs.events,
            weight: WEIGHTS.events,
            contribution: contributions.events,
        },
        {
            code: 'I',
            name: 'Current Incident',
            value: inputs.incidents,
            weight: WEIGHTS.incidents,
            contribution: contributions.incidents,
        },
    ];
    return {
        score: Math.round(score * 10) / 10, // Round to 1 decimal place
        level: level,
        breakdown: breakdown,
    };
}
/**
 * Determine risk level based on score
 * @param score - Risk score (0-100)
 * @returns Risk level (CRITICAL, HIGH, MEDIUM, LOW)
 */
function determineRiskLevel(score) {
    if (score >= 80)
        return 'CRITICAL';
    if (score >= 60)
        return 'HIGH';
    if (score >= 35)
        return 'MEDIUM';
    return 'LOW';
}
/**
 * Normalize historical severity score to 0-1 range
 * @param historicalScore - Score from 0-100
 * @returns Normalized value 0-1
 */
function normalizeHistoricalScore(historicalScore) {
    return Math.min(1, Math.max(0, historicalScore / 100));
}
