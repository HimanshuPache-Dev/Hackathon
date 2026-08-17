"use strict";
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
    ExplainabilityService.prototype.generateExplanation = function (junctionName, result) {
        var sortedFactors = __spreadArray([], result.breakdown, true).sort(function (a, b) { return b.contribution - a.contribution; });
        var topFactors = sortedFactors.slice(0, 3).map(function (f) { return f.code; });
        var summary = this.generateSummary(junctionName, result.score, result.level, sortedFactors);
        return {
            factors: result.breakdown,
            topFactors: topFactors,
            summary: summary,
            riskLevel: result.level,
            score: result.score,
        };
    };
    ExplainabilityService.prototype.generateSummary = function (junctionName, score, level, sortedFactors) {
        var _this = this;
        var top3 = sortedFactors.slice(0, 3);
        var factorDescriptions = top3.map(function (factor) {
            var adjective = _this.getAdjective(factor.value);
            var name = _this.getDisplayName(factor.name);
            return "".concat(adjective, " ").concat(name, " (").concat(factor.contribution.toFixed(1), " points)");
        });
        var top3Text = this.joinFactors(factorDescriptions);
        return "".concat(junctionName, " has a ").concat(level, " risk score of ").concat(score.toFixed(1), " primarily due to ").concat(top3Text, ".");
    };
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
    ExplainabilityService.prototype.joinFactors = function (descriptions) {
        if (descriptions.length === 0)
            return 'unknown factors';
        if (descriptions.length === 1)
            return descriptions[0];
        if (descriptions.length === 2)
            return descriptions.join(' and ');
        return descriptions.slice(0, -1).join(', ') + ', and ' + descriptions.slice(-1);
    };
    ExplainabilityService.prototype.getFactorByCode = function (breakdown, code) {
        return breakdown.find(function (f) { return f.code === code; });
    };
    ExplainabilityService.prototype.getHighImpactFactors = function (breakdown, threshold) {
        if (threshold === void 0) { threshold = 10; }
        return breakdown.filter(function (f) { return f.contribution >= threshold; });
    };
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
