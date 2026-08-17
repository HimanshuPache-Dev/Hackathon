"use strict";
/**
 * Explainability Service
 *
 * Generates human-readable explanations for risk scores.
 * This is what makes SafeFlow "explainable AI" instead of a black box.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplainabilityService = void 0;
var ExplainabilityService = /** @class */ (function () {
    function ExplainabilityService() {
    }
    /**
     * Generate complete risk explanation
     */
    ExplainabilityService.prototype.generateExplanation = function (junctionName, result) {
        // Sort factors by contribution (descending)
        var sortedFactors = __spreadArray([], result.breakdown, true).sort(function (a, b) { return b.contribution - a.contribution; });
        // Get top 3 contributing factors
        var topFactors = sortedFactors.slice(0, 3).map(function (f) { return f.code; });
        // Generate plain-language summary
        var summary = this.generateSummary(junctionName, result.score, result.level, sortedFactors);
        return {
            factors: result.breakdown,
            topFactors: topFactors,
            summary: summary,
            riskLevel: result.level,
            score: result.score,
        };
    };
    /**
     * Generate plain-language summary
     * Example: "Juni Pardi Naka Chowk has a CRITICAL risk score of 87.3
     * primarily due to high historical severity (25.5 points), severe
     * congestion (22.5 points), and a newly reported incident (8.7 points)."
     */
    ExplainabilityService.prototype.generateSummary = function (junctionName, score, level, sortedFactors) {
        var _this = this;
        var top3 = sortedFactors.slice(0, 3);
        // Create factor descriptions with adjectives
        var factorDescriptions = top3.map(function (factor) {
            var adjective = _this.getAdjective(factor.value);
            var name = _this.getDisplayName(factor.name);
            return "".concat(adjective, " ").concat(name, " (").concat(factor.contribution.toFixed(1), " points)");
        });
        // Join with commas and "and"
        var top3Text = this.joinFactors(factorDescriptions);
        return "".concat(junctionName, " has a ").concat(level, " risk score of ").concat(score.toFixed(1), " primarily due to ").concat(top3Text, ".");
    };
    /**
     * Get adjective based on factor value
     */
    ExplainabilityService.prototype.getAdjective = function (value) {
        if (value >= 0.8)
            return 'very high';
        if (value >= 0.6)
            return 'high';
        if (value >= 0.4)
            return 'moderate';
        if (value >= 0.2)
            return 'low';
        return 'very low';
    };
    /**
     * Get display name for factor
     */
    ExplainabilityService.prototype.getDisplayName = function (name) {
        var nameMap = {
            'Accident History': 'historical severity',
            'Congestion': 'congestion',
            'Violations': 'traffic violations',
            'Obstructions': 'road obstructions',
            'Weather': 'weather conditions',
            'Events': 'event pressure',
            'Current Incident': 'current incident',
        };
        return nameMap[name] || name;
    };
    /**
     * Join factor descriptions with proper grammar
     */
    ExplainabilityService.prototype.joinFactors = function (descriptions) {
        if (descriptions.length === 0)
            return 'unknown factors';
        if (descriptions.length === 1)
            return descriptions[0];
        if (descriptions.length === 2)
            return descriptions.join(' and ');
        return descriptions.slice(0, -1).join(', ') + ', and ' + descriptions.slice(-1);
    };
    /**
     * Get factor details by code
     */
    ExplainabilityService.prototype.getFactorByCode = function (breakdown, code) {
        return breakdown.find(function (f) { return f.code === code; });
    };
    /**
     * Get all factors above a threshold
     */
    ExplainabilityService.prototype.getHighImpactFactors = function (breakdown, threshold) {
        if (threshold === void 0) { threshold = 10; }
        return breakdown.filter(function (f) { return f.contribution >= threshold; });
    };
    /**
     * Generate comparison explanation (before vs after)
     */
    ExplainabilityService.prototype.generateComparisonExplanation = function (junctionName, beforeScore, afterScore, beforeLevel, afterLevel) {
        var scoreChange = afterScore - beforeScore;
        var percentChange = ((scoreChange / beforeScore) * 100).toFixed(1);
        var direction = scoreChange > 0 ? 'increased' : 'decreased';
        var levelChange = beforeLevel !== afterLevel
            ? " (risk level changed from ".concat(beforeLevel, " to ").concat(afterLevel, ")")
            : '';
        return "".concat(junctionName, "'s risk score ").concat(direction, " by ").concat(Math.abs(scoreChange).toFixed(1), " points (").concat(percentChange, "%)").concat(levelChange, ".");
    };
    return ExplainabilityService;
}());
exports.ExplainabilityService = ExplainabilityService;
