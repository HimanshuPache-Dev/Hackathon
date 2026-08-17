# Nagpur SafeFlow — Product Requirements Document

**Product Name:** Nagpur SafeFlow
**Full Title:** Nagpur SafeFlow: Explainable AI Traffic-Risk Heatmap and Police Deployment Decision-Support System
**Version:** 1.0 — Hackathon MVP
**Document Owner:** Member 1 — Product Lead, UX Designer & Presentation Lead
**Status:** Ready for team review/freeze

---

## 1. Product Overview

### 1.1 Product Summary

Nagpur SafeFlow is an **explainable, human-in-the-loop traffic-safety decision-support platform** for traffic control-room commanders.

The system combines:

* Historical traffic-accident severity data.
* Current or simulated traffic conditions.
* Explainable weighted risk scoring.
* Interactive geographic visualization.
* Officer-coverage information.
* Unmanned high-risk detection.
* Officer-allocation recommendations.
* Dynamic incident simulation.
* Commander approval controls.
* Baseline-versus-recommended deployment comparison.

SafeFlow helps answer three important operational questions:

1. **Which junctions need attention right now?**
2. **Which high-risk junctions currently have insufficient or no officer coverage?**
3. **Which available officer should be recommended for redeployment?**

SafeFlow is an **AI-assisted decision-support system using transparent weighted risk scoring and officer-allocation logic**.

It is NOT an autonomous policing system.

The system must never automatically dispatch, move, or assign officers without explicit commander approval.

---

# 2. Problem Statement

Traffic-police personnel are limited, while traffic risk changes according to conditions such as:

* Historical accident severity.
* Congestion.
* Traffic violations.
* Road obstruction.
* Weather.
* Nearby events.
* Current incidents.

Traditional/static deployment may leave a high-risk junction without adequate officer coverage when conditions change.

Commanders therefore need a system that can combine historical evidence with current operational conditions, identify priority junctions, detect coverage gaps, recommend efficient deployment, and explain why each recommendation was generated.

Nagpur SafeFlow addresses this problem through an interactive command dashboard while keeping the final deployment decision with the human commander.

---

# 3. Product Goals

## 3.1 Primary Goals

### G-01 — Risk Identification

Provide a clear view of operational traffic risk across the 20 selected Nagpur junctions.

### G-02 — Explainable Risk

Explain why each junction receives its current risk score.

### G-03 — Coverage-Gap Detection

Automatically identify HIGH and CRITICAL junctions with no officer coverage.

### G-04 — Officer Recommendation

Recommend an appropriate available officer for an uncovered high-risk junction.

### G-05 — Dynamic Recalculation

Recalculate risk when current operational conditions change or a simulated incident occurs.

### G-06 — Human Control

Require the commander to explicitly:

* Accept
* Modify
* Reject

every deployment recommendation.

### G-07 — Deployment Comparison

Compare static deployment against SafeFlow-recommended deployment.

### G-08 — Accountability

Maintain an audit trail of commander decisions.

### G-09 — Demonstrability

Provide a reliable and understandable end-to-end workflow suitable for a hackathon demonstration.

---

# 4. Non-Goals

The following functionality is outside the MVP.

### NG-01 — Autonomous Dispatch

SafeFlow will not automatically dispatch or move officers.

### NG-02 — Individual Behaviour Prediction

SafeFlow will not predict criminal behaviour or risk associated with individual people.

### NG-03 — Accident Probability Prediction

SafeFlow will not claim that a junction has a specific probability of an accident occurring.

### NG-04 — Live Officer GPS

Officer positions may be simulated or represented using predefined locations for the MVP.

### NG-05 — Live Traffic API

Congestion and several operational inputs may be simulated during the MVP.

### NG-06 — Native Mobile Application

The primary MVP is a responsive web application.

### NG-07 — Multi-City Deployment

The MVP focuses on the selected Nagpur junctions.

### NG-08 — Emergency-Service Integration

Ambulance, fire-service and other emergency-response integrations are outside the MVP.

### NG-09 — Machine-Learning Accident Prediction

The MVP uses a transparent weighted scoring model rather than a trained predictive ML model.

---

# 5. Target User

## 5.1 Primary User

**Traffic Control Room Commander**

The commander needs to:

* Monitor junction risk.
* Understand changing traffic conditions.
* Identify uncovered dangerous locations.
* Review officer availability.
* Review recommendations.
* Accept, modify or reject recommendations.
* Understand why the system generated a recommendation.

---

## 5.2 Secondary User

### System Administrator

Responsible for:

* User/account configuration.
* Data maintenance.
* System configuration.
* Technical monitoring.

Administration features beyond those required for the demo are not part of the core MVP.

---

# 6. Product Principles

## 6.1 Human-in-the-Loop

No deployment recommendation becomes an actual system assignment without commander approval.

## 6.2 Explainability First

Every important risk score and deployment recommendation should have an understandable explanation.

## 6.3 Historical ≠ Current

Historical traffic severity and current operational risk must always remain conceptually and visually separate.

## 6.4 No False Probability Claims

The historical score must be called:

**Historical Severity Priority Score**

It must NOT be described as:

**Accident Probability**

## 6.5 Simulation Transparency

Values that are simulated must be clearly identified as:

**SIMULATED**

unless they come from an actual API or documented source.

## 6.6 Reliability Over Complexity

For the hackathon MVP, a reliable end-to-end workflow is more important than unnecessary AI features.

## 6.7 Actionable Information

The dashboard should prioritize information that helps the commander make a decision.

---

# 7. Core Product Flow

The primary workflow is:

```text
Commander Login
      ↓
Onboarding
      ↓
SafeFlow Dashboard
      ↓
View Nagpur Risk Map
      ↓
View Ranked Risky Junctions
      ↓
Select Junction
      ↓
View Historical + Current Risk
      ↓
Understand Risk Explanation
      ↓
Simulate Incident
      ↓
Backend Recalculates Risk
      ↓
Re-rank Junctions
      ↓
Detect Unmanned High-Risk Junction
      ↓
Generate Officer Recommendation
      ↓
Display Recommendation + Explanation
      ↓
Commander Decision
   ↙      ↓       ↘
Accept  Modify   Reject
   ↘      ↓       ↙
     Decision Log
          ↓
Update Deployment State
          ↓
Update Dashboard Metrics
          ↓
Baseline vs Recommended Comparison
```

---

# 8. Functional Requirements

## FR-01 — Authentication

### FR-01.1

The system shall provide commander login using email and password.

**Priority:** P0

### FR-01.2

Passwords shall never be stored in plaintext.

**Priority:** P0

### FR-01.3

Passwords shall be hashed using bcrypt.

**Priority:** P0

### FR-01.4

Successful authentication shall create an authenticated session using JWT.

**Priority:** P0

### FR-01.5

Protected dashboard APIs shall require authentication.

**Priority:** P0

### FR-01.6

Public backend endpoints shall be limited to required authentication and health-check endpoints.

**Priority:** P0

### FR-01.7

The application shall provide logout functionality.

**Priority:** P1

---

# 9. Onboarding Requirements

## FR-02.1

The application shall provide a short three-step onboarding experience.

### Step 1 — See Risk

Explain that SafeFlow shows high-risk traffic junctions and their current operational priority.

### Step 2 — Deploy Smarter

Explain that SafeFlow recommends how limited traffic personnel can be allocated.

### Step 3 — Keep Human Control

Explain that recommendations never automatically deploy an officer.

The commander always makes the final decision.

**Priority:** P1

---

# 10. Dashboard Requirements

## FR-03.1 — Header

The dashboard shall display:

* Nagpur Traffic Control Room.
* SafeFlow Command Center.
* System status.
* Current time.
* Simulate Incident button.
* Commander profile.

**Priority:** P0

---

## FR-03.2 — Metrics Strip

The dashboard shall display:

* Total junctions.
* Critical junctions.
* Unmanned high-risk junctions.
* Current coverage percentage.
* Recommended coverage percentage.
* Estimated response time.

**Priority:** P0

---

# 11. Interactive Risk Map

## FR-04.1

The dashboard shall display the selected 20 Nagpur junctions on an interactive map.

**Priority:** P0

## FR-04.2

The map shall use the following operational risk colors:

* 🔴 CRITICAL
* 🟠 HIGH
* 🟡 MEDIUM
* 🟢 LOW

**Priority:** P0

## FR-04.3

The map shall display officer locations.

**Priority:** P0

## FR-04.4

The map shall display active simulated incident markers.

**Priority:** P0

## FR-04.5

The map shall include a risk legend.

**Priority:** P0

## FR-04.6

Selecting a junction shall show its basic operational information and allow the commander to inspect its details.

**Priority:** P0

## FR-04.7

The map shall support standard pan and zoom interactions.

**Priority:** P1

---

# 12. Risk Ranking

## FR-05.1

The system shall rank junctions according to their current operational risk score.

**Priority:** P0

## FR-05.2

The ranking shall display:

* Rank.
* Junction name.
* Current score.
* Current risk category.
* Officer coverage.
* Main risk reasons.

**Priority:** P0

## FR-05.3

Higher current operational risk scores shall appear before lower scores.

**Priority:** P0

## FR-05.4

The ranking shall update after risk recalculation.

**Priority:** P0

---

# 13. Junction Details

The junction-details interface shall display:

* Junction name.
* Coordinates.
* Historical Severity Priority Score.
* Current Operational Risk Score.
* Historical crashes.
* Fatalities.
* Major injuries.
* Minor injuries.
* Weighted severity.
* Current congestion.
* Current violations.
* Current obstruction.
* Current weather risk.
* Event pressure.
* Current incident severity.
* Current officer coverage.
* Risk explanations.

Historical and current operational information must be visually distinguishable.

**Priority:** P0

---

# 14. Risk Scoring

## 14.1 Risk Inputs

The operational risk model uses:

* **A** = Accident-history factor
* **C** = Congestion
* **V** = Violations
* **O** = Obstruction
* **W** = Weather
* **E** = Event pressure
* **I** = Current incident severity

Each normalized factor uses a value between:

```text
0.0 – 1.0
```

---

## 14.2 Risk Formula

The frozen risk formula is:

```text
RiskScore =
100 ×
(
  0.30A +
  0.25C +
  0.15V +
  0.10O +
  0.05W +
  0.05E +
  0.10I
)
```

The weights are:

| Factor           | Weight |
| ---------------- | -----: |
| Accident history |    30% |
| Congestion       |    25% |
| Violations       |    15% |
| Obstruction      |    10% |
| Weather          |     5% |
| Event            |     5% |
| Current incident |    10% |

These weights are frozen for the MVP.

---

# 15. Risk Categories

The system shall classify the current operational score as:

|  Score | Risk Level |
| -----: | ---------- |
| 80–100 | CRITICAL   |
|  60–79 | HIGH       |
|  35–59 | MEDIUM     |
|   0–34 | LOW        |

**Priority:** P0

---

# 16. Historical Risk Requirements

The system must keep:

```text
historicalScore
```

separate from:

```text
currentScore
```

The historical score shall be presented as:

**Historical Severity Priority Score**

The application must never present it as:

```text
100% accident probability
```

or any equivalent accident-probability claim.

---

# 17. Explainability Requirements

## FR-06.1

The system shall provide human-readable reasons for a junction's current risk.

**Priority:** P0

Example:

> High historical severity, congestion above normal and a newly reported incident are increasing current operational priority.

## FR-06.2

The interface should identify the strongest contributing risk factors.

**Priority:** P0

## FR-06.3

Historical factors shall be distinguishable from current operational factors.

**Priority:** P0

## FR-06.4

The explanation shall avoid describing the score as a probability.

**Priority:** P0

---

# 18. Unmanned High-Risk Detection

## FR-07.1

A junction shall be considered an unmanned high-risk location when:

```text
Risk Level = HIGH or CRITICAL
AND
Officer Count = 0
```

**Priority:** P0

## FR-07.2

The system shall detect unmanned high-risk junctions after risk recalculation.

**Priority:** P0

## FR-07.3

Unmanned high-risk junctions shall be visually highlighted.

**Priority:** P0

## FR-07.4

The dashboard shall show the total number of unmanned high-risk junctions.

**Priority:** P0

---

# 19. Deployment Priority

Coverage gap must NOT modify the road-risk score.

Instead it shall influence deployment priority.

The frozen deployment formula is:

```text
DeploymentPriority =
0.85 × RiskScore +
15 × CoverageGap
```

Where:

```text
CoverageGap = 1
```

when the junction has no officer assigned, otherwise:

```text
CoverageGap = 0
```

This separation is mandatory.

---

# 20. Officer Management

Officer status values are frozen as:

```text
AVAILABLE
DEPLOYED
BUSY
EN_ROUTE
```

An officer record shall include at minimum:

* ID.
* Name.
* Badge code.
* Status.
* Current junction/location.
* Current assignment where applicable.

The demo may use approximately 10–15 simulated officers.

---

# 21. Officer Recommendation

## FR-08.1

The backend shall generate recommendations for uncovered high-priority junctions.

**Priority:** P0

## FR-08.2

The recommendation shall identify an appropriate available officer.

**Priority:** P0

## FR-08.3

Officer recommendation may consider:

* Officer availability.
* Current officer location.
* Destination junction.
* Distance.
* Estimated travel time.
* Deployment priority.

**Priority:** P0

## FR-08.4

The recommendation shall provide an explanation.

Example:

> Officer 07 is recommended because the officer is currently available and is the closest suitable unit to the high-priority unmanned junction.

**Priority:** P0

## FR-08.5

The recommendation shall NOT automatically change deployment.

**Priority:** P0

---

# 22. Recommendation Panel

The recommendation interface shall display:

* Officer name.
* Current location.
* Recommended destination.
* Estimated travel time.
* Expected improvement where calculated.
* Recommendation reasons.

It shall provide three actions:

```text
ACCEPT
MODIFY
REJECT
```

**Priority:** P0

---

# 23. Human Approval

## FR-09.1 — Accept

When the commander accepts a recommendation:

1. Explicit confirmation shall be obtained.
2. The approved assignment shall be recorded.
3. Officer/deployment state shall update.
4. The decision shall be logged.
5. Dashboard metrics shall update.

**Priority:** P0

---

## FR-09.2 — Modify

The commander shall be able to replace the recommended officer or destination with an allowed alternative before approval.

The modified decision shall be recorded.

**Priority:** P0

---

## FR-09.3 — Reject

The commander shall be able to reject the recommendation.

Rejection shall:

* Not change deployment.
* Record the rejection.
* Optionally record a commander rationale.

**Priority:** P0

---

## FR-09.4 — No Automatic Approval

SafeFlow must NEVER automatically accept its own recommendation.

**Priority:** P0

---

# 24. Incident Simulation

## FR-10.1

The dashboard shall provide a:

**Simulate Incident**

action.

**Priority:** P0

## FR-10.2

The commander shall be able to select a junction.

**Priority:** P0

## FR-10.3

The incident shall affect the appropriate current operational inputs.

**Priority:** P0

## FR-10.4

Every simulated incident shall be clearly marked:

**SIMULATED**

**Priority:** P0

## FR-10.5

Incident simulation shall trigger backend risk recalculation.

**Priority:** P0

## FR-10.6

The frontend shall update to show the resulting changes.

**Priority:** P0

---

# 25. Dynamic Recalculation

When an incident occurs, the system shall:

1. Create/update the incident.
2. Update affected operational inputs.
3. Recalculate current risk.
4. Reclassify risk level.
5. Re-rank junctions.
6. Detect unmanned high-risk locations.
7. Recalculate deployment priority.
8. Generate/update officer recommendations.
9. Send relevant updates to the frontend.
10. Wait for commander action.

**Priority:** P0

---

# 26. Realtime Requirements

Socket.IO shall be used for realtime communication between the Express backend and React frontend where realtime updates improve the operational workflow.

Realtime events may include:

* Risk updated.
* Ranking updated.
* Incident created.
* Recommendation generated.
* Deployment updated.
* Metrics updated.

Socket.IO disconnection shall not cause the application to become unusable.

The UI shall indicate connectivity problems when relevant.

**Priority:** P0

---

# 27. Decision Logging

Every Accept, Modify or Reject action shall create an audit record.

The decision record shall contain at minimum:

* Decision ID.
* Recommendation ID.
* Commander/user ID.
* Officer ID where applicable.
* Junction ID.
* Action.
* Previous recommendation where relevant.
* Modified selection where relevant.
* Optional rationale.
* Timestamp.

Decision logs shall be stored in PostgreSQL.

**Priority:** P0

---

# 28. Baseline vs Recommended Comparison

The system shall compare:

**Static Deployment**

against:

**SafeFlow Recommended Deployment**

The comparison should include:

* High-risk coverage percentage.
* Number of unmanned high-risk junctions.
* Estimated response time.

The UI must clearly indicate that metrics produced from simulated scenarios are:

**SIMULATION RESULTS**

They must not be represented as verified real-world police performance.

**Priority:** P0

---

# 29. Data Requirements

## 29.1 Authoritative Junction Dataset

The project's provided Nagpur junction dataset is the authoritative source for the 20 selected junctions.

It provides or supports information including:

* Junction IDs.
* Junction names.
* Latitude.
* Longitude.
* Historical crashes.
* Fatalities.
* Major injuries.
* Minor injuries.
* Weighted severity.
* Historical priority.
* Risk tier.
* Source information.
* Evidence notes.
* Confidence information.
* Dynamic-risk fields.

The implementation must not silently replace this dataset with a separately sourced list of junctions.

---

# 30. Data Classification

Every relevant data field should conceptually belong to one of these categories:

### SOURCE-REPORTED

Directly supported by the provided historical dataset or documented source.

### DERIVED

Calculated from source or operational inputs.

Examples:

* Normalized historical factor.
* Current risk score.
* Deployment priority.

### SIMULATED

Generated specifically for demonstration.

Examples may include:

* Congestion.
* Violations.
* Obstruction.
* Events.
* Officer locations.
* Current incidents.

### LIVE

Retrieved from an actual external/current service.

Example:

* Current weather when Open-Meteo is available.

The UI should make these distinctions clear where they affect interpretation.

---

# 31. Weather Integration

SafeFlow may use Open-Meteo for:

* Rain conditions.
* Visibility where available.
* Temperature.
* Other weather information required to derive the weather-risk input.

The backend shall convert relevant weather information into the normalized weather-risk factor.

A fallback shall exist so the hackathon demonstration does not fail if the weather service is unavailable.

---

# 32. API Requirements

The React frontend shall communicate with the backend using REST APIs.

Expected API domains include:

```text
/api/auth
/api/junctions
/api/officers
/api/incidents
/api/recommendations
/api/decisions
/api/metrics
```

The detailed request and response contracts shall be frozen separately in:

```text
docs/api-contract.md
```

---

# 33. Shared Data Contract

Frontend and backend shall use consistent TypeScript contracts.

Core entities include:

* Junction.
* RiskInputs.
* Officer.
* Incident.
* Recommendation.
* Deployment.
* DecisionLog.
* Metrics.
* APIError.

The canonical contract shall be documented in:

```text
docs/data-contract.md
```

and implemented in:

```text
shared/types/index.ts
```

Field names must not be changed independently by different team members after the contract is frozen.

---

# 34. Security Requirements

## SEC-01

Passwords shall be hashed using bcrypt.

**Priority:** P0

## SEC-02

Protected API endpoints shall require valid authentication.

**Priority:** P0

## SEC-03

Authentication shall use JWT.

**Priority:** P0

## SEC-04

Credentials, JWT secrets and database credentials shall be stored using environment variables.

**Priority:** P0

## SEC-05

Request data shall be validated before business logic executes.

**Priority:** P0

## SEC-06

Database operations shall use safe parameterized queries or an equivalent safe data-access mechanism.

**Priority:** P0

## SEC-07

Production CORS configuration shall restrict access to the expected frontend origin.

**Priority:** P0

## SEC-08

Sensitive credentials must never be committed to GitHub.

**Priority:** P0

---

# 35. Reliability Requirements

The MVP shall provide:

* Loading states.
* Empty states.
* Error states.
* Weather-service fallback.
* Graceful Socket.IO reconnection.
* Demo data available before presentation.
* No broken primary buttons.
* No blank primary screens.
* Backend error handling.
* A backup demonstration strategy.

**Priority:** P0

---

# 36. Accessibility Requirements

## ACC-01

Risk must never be communicated using color alone.

Display both:

```text
🔴 CRITICAL
```

rather than only a red marker.

**Priority:** P0

## ACC-02

Important buttons and forms shall have understandable labels.

**Priority:** P1

## ACC-03

Keyboard accessibility should be supported for normal dashboard controls.

**Priority:** P1

## ACC-04

Text and important controls should maintain readable contrast.

**Priority:** P1

## ACC-05

Form validation errors shall clearly explain the problem.

**Priority:** P1

---

# 37. Performance Requirements

For the hackathon MVP, the primary performance objective is **responsive and reliable interaction**, rather than arbitrary production benchmarks.

The application should:

* Load the primary dashboard quickly under normal demo conditions.
* Keep map interactions responsive.
* Recalculate risk quickly enough to appear immediate to the commander.
* Display realtime changes promptly.
* Avoid unnecessary network requests.
* Avoid blocking the interface during recalculation.

Performance problems that interrupt the primary demonstration are P0 defects.

---

# 38. Analytics Requirements

Useful product events may include:

* Dashboard opened.
* Junction selected.
* Incident simulated.
* Recommendation viewed.
* Recommendation accepted.
* Recommendation modified.
* Recommendation rejected.

Analytics are secondary to the primary operational workflow.

External analytics integration may be P1/P2 depending on available hackathon time.

---

# 39. Main Demo Scenario

The primary hackathon scenario shall use:

**Juni Pardi Naka Chowk**

---

## 39.1 Starting State

The demonstration begins with:

* 20 junctions loaded.
* Approximately 10–15 simulated officers.
* Multiple risk categories visible.
* Some high-risk locations covered.
* At least one high-risk location unmanned.
* Baseline deployment metrics visible.

---

## 39.2 Incident

The commander selects:

**Simulate Incident**

at:

**Juni Pardi Naka Chowk**

Demo operational values include:

```text
Current Incident = 1.0
Congestion       = 0.9
Weather Risk     = 0.4
Officer Count    = 0
```

These demo values must be marked as simulated where applicable.

---

## 39.3 Expected System Behaviour

SafeFlow shall:

1. Record the simulated incident.
2. Increase current operational risk.
3. Recalculate the score.
4. Classify the junction as appropriate based on the resulting score.
5. Re-rank the junction.
6. Detect that it is unmanned.
7. Calculate deployment priority.
8. Evaluate available officers.
9. Recommend an appropriate officer.
10. Explain the recommendation.
11. Wait for commander approval.

---

## 39.4 Example Explanation

> Juni Pardi Naka Chowk is prioritized because it has high historical severity, a newly reported incident, congestion above normal, and no current officer coverage. Officer 07 is recommended because that officer is the closest suitable available unit.

---

# 40. First 30 Seconds of Judge Experience

The judge should immediately understand:

### What is happening?

Traffic risk is changing across Nagpur.

### What is the problem?

Police personnel are limited and some high-risk locations may be uncovered.

### What does SafeFlow do?

SafeFlow identifies high-priority junctions and recommends where available officers can be deployed.

### Is the AI making police decisions automatically?

No.

The commander remains in control.

The initial dashboard should therefore prioritize:

1. Nagpur risk map.
2. Critical-junction count.
3. Unmanned high-risk count.
4. Ranked high-risk locations.
5. Officer coverage.
6. Clear Simulate Incident action.

---

# 41. MVP Scope

## P0 — Demo Critical

The following must work before presentation:

* Authentication/login or reliable demo login.
* Dashboard.
* 20 junctions.
* Interactive map.
* Correct risk colors.
* Current risk ranking.
* Junction details.
* Historical/current distinction.
* Explainable risk.
* Officer coverage.
* Unmanned high-risk detection.
* Incident simulation.
* Backend risk recalculation.
* Officer recommendation.
* Recommendation explanation.
* Accept.
* Modify.
* Reject.
* Decision logging.
* Baseline comparison.
* Simulation labels.
* Required realtime updates.
* Error handling.

---

# 42. P1 — Important

Implement after P0 is stable:

* Onboarding.
* Enhanced animations.
* Additional charts.
* Decision-history interface.
* Improved weather visualization.
* Advanced responsive layout.
* Additional accessibility improvements.
* Additional analytics.

---

# 43. P2 — Nice to Have

Only implement if sufficient time remains:

* Advanced analytics.
* Extended historical trends.
* Additional scenario presets.
* More sophisticated routing.
* Additional administrator features.
* Additional visual polish.

---

# 44. Future Scope

Potential post-MVP capabilities include:

* Live traffic integration.
* Real officer GPS with appropriate governance.
* Additional cities.
* Field-officer application.
* More advanced routing.
* Larger datasets.
* Historical trend analysis.
* Advanced optimization.
* Multilingual interface.
* Additional operational integrations.

These are NOT required for the hackathon MVP.

---

# 45. Success Metrics

## 45.1 Hackathon Success

The MVP is successful if:

1. The complete demonstration can be performed reliably.
2. Judges understand the problem quickly.
3. Judges can identify the difference between historical and current risk.
4. Incident simulation visibly changes operational risk.
5. The system detects an uncovered high-risk location.
6. The system recommends an officer.
7. The recommendation has an understandable explanation.
8. The commander can Accept, Modify or Reject it.
9. The resulting decision is logged.
10. Baseline-versus-recommended improvement can be demonstrated.
11. Simulated data is clearly identified.

---

## 45.2 Simulation Metrics

The system should calculate metrics such as:

* High-risk coverage improvement.
* Reduction in unmanned high-risk junctions.
* Estimated response-time improvement.

These are **simulation results**, not claims about real-world police outcomes.

---

# 46. Key Risks

| Risk                          | Impact                       | Mitigation                                   |
| ----------------------------- | ---------------------------- | -------------------------------------------- |
| External API unavailable      | Demo interruption            | Provide fallback data                        |
| Map service problem           | Major visual failure         | Prepare fallback/demo strategy               |
| Backend deployment failure    | Application unavailable      | Test early and maintain local backup         |
| Socket connection failure     | Realtime updates unavailable | Graceful reconnect/fallback                  |
| Incorrect risk implementation | Invalid demo                 | Unit-test frozen formula                     |
| Dataset mismatch              | Incorrect results            | Use authoritative provided dataset           |
| Scope creep                   | Core features incomplete     | Follow P0/P1/P2 priorities                   |
| Team conflicts                | Integration delays           | Freeze contracts before parallel development |
| Misleading AI claims          | Credibility issue            | Explain weighted scoring clearly             |
| Demo failure                  | Presentation impact          | Record backup demonstration                  |

---

# 47. Assumptions

The MVP assumes:

* A modern desktop browser.
* Internet connectivity during normal operation.
* The supplied historical dataset is the project source of truth.
* Officer locations/statuses may be simulated.
* Congestion, violations, obstruction, events and incidents may be simulated.
* Weather may come from Open-Meteo.
* A fallback exists for external services.
* Approximately 10–15 officer records are sufficient for the demonstration.

---

# 48. Constraints

### Time

The product is being developed within a hackathon timeframe.

### Team

Five members work in parallel.

### Dataset

The MVP is based on 20 selected Nagpur junctions.

### Budget

Prefer free/open-source technologies and free service tiers.

### Human Control

No autonomous officer deployment.

### Transparency

Simulated and historical information must not be misrepresented as live predictive information.

---

# 49. Frozen Technology Stack

## Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* MapLibre
* GeoJSON
* Recharts
* React Hook Form
* Zod
* Socket.IO Client

---

## Backend

* Node.js
* Express.js
* TypeScript
* REST APIs
* Socket.IO Server
* Zod
* JWT
* bcrypt

---

## Database

**PostgreSQL**

Database responsibilities include storing:

* Users.
* Junctions.
* Officers.
* Incidents.
* Deployments.
* Recommendations.
* Decision logs.

---

## Mapping

* MapLibre
* GeoJSON
* OpenStreetMap or compatible map-tile provider

---

## Weather

* Open-Meteo
* Local/demo fallback

---

## Deployment

### Frontend

Vercel

### Backend

Render or Railway

### Database

Hosted PostgreSQL

---

# 50. System Architecture

```text
┌───────────────────────────────────────┐
│          React + Vite Frontend        │
│                                       │
│ Map │ Ranking │ Metrics │ Decisions   │
└───────────────────┬───────────────────┘
                    │
             REST API + Socket.IO
                    │
                    ▼
┌───────────────────────────────────────┐
│       Node.js + Express.js Backend    │
│                                       │
│ Auth │ Controllers │ Validation       │
└───────────────────┬───────────────────┘
                    │
                    ▼
┌───────────────────────────────────────┐
│          Application Services         │
│                                       │
│ Risk Engine                           │
│ Explainability Engine                 │
│ Officer Allocation Engine             │
│ Simulation Service                    │
│ Weather Service                       │
└───────────────┬───────────────┬───────┘
                │               │
                ▼               ▼
        ┌──────────────┐   ┌─────────────┐
        │ PostgreSQL   │   │ Open-Meteo  │
        │ Database     │   │ Weather API │
        └──────────────┘   └─────────────┘
```

---

# 51. Frontend Responsibility

React is responsible for:

* Rendering the dashboard.
* Map visualization.
* Forms.
* Risk ranking.
* Junction details.
* Recommendation UI.
* Commander controls.
* Charts.
* Loading/error states.
* Receiving realtime events.

React must NOT become the authoritative implementation of the risk/allocation algorithms.

---

# 52. Backend Responsibility

Express.js is responsible for:

* Authentication.
* Authorization.
* API validation.
* Junction APIs.
* Officer APIs.
* Incident APIs.
* Risk calculation.
* Explainability.
* Unmanned detection.
* Deployment priority.
* Officer recommendation.
* Commander decision processing.
* Audit logging.
* Weather integration.
* Realtime event emission.

The backend is the authoritative source for operational calculations.

---

# 53. Database Entities

The MVP database shall support:

```text
users

junctions

officers

incidents

deployments

recommendations

decision_logs
```

Exact schemas will be frozen separately.

---

# 54. Repository Architecture

```text
nagpur-safeflow/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── charts/
│       │   ├── onboarding/
│       │   └── ui/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── types/
│       └── utils/
│
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       │   └── risk/
│       ├── middleware/
│       ├── models/
│       ├── socket/
│       └── utils/
│
├── database/
│   └── migrations/
│
├── data/
│
├── shared/
│   └── types/
│
├── docs/
│
├── .gitignore
└── README.md
```

---

# 55. Team Integration Rules

Because five team members will work in parallel:

1. `PRD.md` defines **what** the product does.
2. `product-flow.md` defines **how the user moves through it**.
3. `user-stories.md` defines functionality from the user's perspective.
4. `acceptance-criteria.md` defines how functionality is verified.
5. `architecture.md` defines technical boundaries.
6. `api-contract.md` freezes frontend/backend communication.
7. `data-contract.md` freezes shared entities and field names.
8. `ui-specification.md` defines the interface.
9. `tasks.md` assigns implementation work.

After `api-contract.md` and `data-contract.md` are frozen, team members must not independently rename fields or change API response structures.

---

# 56. Mandatory Product Rules

These requirements override convenience during implementation.

### RULE-01

Historical Severity Priority Score is not accident probability.

### RULE-02

Historical and current operational risk must remain separate.

### RULE-03

Simulated data must be identified as simulated.

### RULE-04

CoverageGap must not be added directly to RiskScore.

### RULE-05

The frozen RiskScore formula must not be independently changed.

### RULE-06

The commander must approve deployment decisions.

### RULE-07

SafeFlow must not automatically dispatch officers.

### RULE-08

Risk/allocation calculations belong to the backend.

### RULE-09

The provided project dataset is the authoritative junction dataset.

### RULE-10

Frontend and backend must follow the frozen API/data contracts.

---

# 57. Final Product Positioning

Use the following description when explaining the product:

**Nagpur SafeFlow is an explainable, human-in-the-loop traffic-safety command platform that combines historical blackspot evidence with simulated or live operational conditions to identify uncovered high-risk junctions and recommend efficient deployment of limited personnel.**

The strongest demonstration should communicate this chain:

```text
Historical Data
       ↓
Dynamic Operational Risk
       ↓
Uncovered High-Risk Junction
       ↓
Officer Recommendation
       ↓
Commander Approval
       ↓
Measurable Simulated Improvement
```

---

# 58. MVP Definition of Success

The MVP is complete when a judge can watch this single workflow without explanation gaps:

```text
Open Dashboard
      ↓
Understand Current Nagpur Risk
      ↓
Select Juni Pardi Naka Chowk
      ↓
Understand Historical + Current Factors
      ↓
Simulate New Incident
      ↓
Watch Risk Recalculate
      ↓
See Junction Become Higher Priority
      ↓
See Unmanned Alert
      ↓
Receive Officer Recommendation
      ↓
Understand WHY Officer Was Recommended
      ↓
Accept / Modify / Reject
      ↓
See Decision Logged
      ↓
See Updated Deployment Metrics
      ↓
Compare Static vs SafeFlow Recommendation
```

If this workflow is stable, explainable, visually clear, and correctly labelled, the core SafeFlow hackathon MVP is successful.

---

**END OF PRD — Version 1.0**
