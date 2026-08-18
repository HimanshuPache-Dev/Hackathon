# Nagpur SafeFlow traffic-data decision record

Status: research only. No provider is configured, and the current planner must remain labelled **FORECAST / MODELLED**.

## Recommended separation

- Live flow and road incidents: evaluate HERE Traffic API or TomTom Traffic API in a Nagpur coverage trial before procurement.
- Officer-to-junction ETAs: evaluate Google Routes `TRAFFIC_AWARE` matrices or Mapbox `driving-traffic`; never store/display provider results outside the applicable licence.
- Historical time-of-day modelling: procure TomTom Traffic Stats or HERE Traffic Analytics if raw/derived retention terms satisfy the police use case.
- Long-term crash evidence: continue using the supplied immutable Excel evidence. The Government of India Nagpur traffic catalogue currently exposes intersection counts, not a live congestion feed.

## Official-source findings

| Provider | Documented capability | Authentication / commercial model | Retention and operational caveat |
|---|---|---|---|
| Google Routes | Traffic-aware route and matrix estimates; traffic-aware polylines | API key/OAuth, billing enabled, pay per request/matrix element | Most Routes content caching is restricted and map display carries Google attribution requirements. Confirm police operational use and India pricing contractually. |
| TomTom | Real-time flow speeds/travel times, incidents, and separate historical Traffic Stats route/area analysis | API key; Traffic Stats advertises a trial and sales-based access | Confirm Nagpur market coverage, update SLA, derived-data retention and public-safety terms during procurement. |
| HERE | Real-time flow speed/jam factor with source update time; separate incident feed; commercial historical analytics | API key or bearer token; platform transactions/pricing | Strong functional fit for flow plus incidents, but coverage, retention and government operational rights require a written contract. |
| Mapbox | `driving-traffic` uses current and historic conditions, supports congestion annotations, closures, incidents and predicted departure times | Access token, request pricing and rate limits | Traffic coverage varies and can fall back to non-traffic routing. Confirm India/Nagpur coverage and raw/derived traffic licensing. |
| India OGD / Nagpur Smart City | Nagpur signalized-intersection catalogue and annual/static transport resources | Open download under the stated government open-data licence | Useful for inventory/provenance, not a real-time or time-of-day congestion source. An authorized city/ICCC feed would require separate coordination. |

## Primary references

- Google Routes billing: https://developers.google.com/maps/documentation/routes/usage-and-billing
- Google Routes policies: https://developers.google.com/maps/documentation/routes/policies
- TomTom Traffic API: https://developer.tomtom.com/traffic-api/documentation/product-information/introduction
- TomTom Traffic Stats: https://developer.tomtom.com/traffic-stats/documentation/api/introduction
- HERE Traffic API: https://docs.here.com/traffic-api/docs/introduction-to-here-traffic-api-v7
- Mapbox Directions API: https://docs.mapbox.com/api/navigation/directions/
- India OGD Nagpur traffic catalogue: https://jk.data.gov.in/catalog/traffic-nagpur

## Procurement gate

Do not label data **LIVE**, use it for automatic deployment, or persist provider-derived observations until Nagpur coverage, update frequency, SLA/outage handling, pricing, attribution, retention, derived-data rights, privacy impact, and authorized police operational use are verified in writing.
