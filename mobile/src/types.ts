export type OfficerStatus='OFF_DUTY'|'AVAILABLE'|'ON_PATROL'|'BUSY'|'EN_ROUTE'|'DEPLOYED';
export interface Officer{id:string;name:string;badge_code:string;status:OfficerStatus}
export interface Point{latitude:number;longitude:number;accuracy?:number;recorded_at?:string}
export interface JunctionOption{id:string;junction_id:string;name:string;latitude:number;longitude:number}
export interface Assignment{id:string;incident_id?:string;officer_id:string;junction_id:string;recommendation_text:string;travel_time_minutes:number;reasons:string[];status:'ACCEPTED'|'MODIFIED';commander_decision_at?:string;officer_response_status:'PENDING'|'ACCEPTED'|'REJECTED'|'ARRIVED';officer_responded_at?:string;officer_arrived_at?:string;field_reports?:Array<{id:string;created_at:string;report_kind:string}>;junctions?:{name:string;current_risk_score:number;current_risk_level:string;latitude:number;longitude:number}}
export type Screen='duty'|'assignment'|'incident'|'notes'|'profile';
