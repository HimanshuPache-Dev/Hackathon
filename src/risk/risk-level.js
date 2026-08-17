"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determineRiskLevel = determineRiskLevel;
exports.isValidRiskLevel = isValidRiskLevel;
exports.getRiskLevelColor = getRiskLevelColor;
function determineRiskLevel(score) {
    if (score >= 80)
        return 'CRITICAL';
    if (score >= 60)
        return 'HIGH';
    if (score >= 35)
        return 'MEDIUM';
    return 'LOW';
}
function isValidRiskLevel(level) {
    return ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(level);
}
function getRiskLevelColor(level) {
    switch (level) {
        case 'CRITICAL':
            return '#DC2626';
        case 'HIGH':
            return '#EA580C';
        case 'MEDIUM':
            return '#EAB308';
        case 'LOW':
            return '#16A34A';
        default:
            return '#6B7280';
    }
}
