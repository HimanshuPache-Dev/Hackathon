import AsyncStorage from '@react-native-async-storage/async-storage';
const baseUrl=process.env.EXPO_PUBLIC_API_URL??'http://localhost:3001/api';
const tokenKey='safeflow_officer_token';let token:string|null=null;
export async function restoreOfficerToken(){token=await AsyncStorage.getItem(tokenKey);return token}
export async function setOfficerToken(value:string){token=value;await AsyncStorage.setItem(tokenKey,value)}
export async function clearOfficerToken(){token=null;await AsyncStorage.removeItem(tokenKey)}
async function request<T>(path:string,options?:RequestInit):Promise<T>{const response=await fetch(`${baseUrl}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} :{}),...options?.headers}});const body=await response.json();if(!response.ok){if(response.status===401)await clearOfficerToken();throw new Error(body.error??'Request failed')}return body}
export const api={
  officerLogin:async(badge_code:string,pin:string)=>{const result=await request<any>('/auth/officer-login',{method:'POST',body:JSON.stringify({badge_code,pin})});await setOfficerToken(result.token);return result.officer},
  startDuty:(id:string,location:any)=>request<any>(`/officers/${id}/duty/start`,{method:'POST',body:JSON.stringify(location)}),
  stopDuty:(id:string)=>request<any>(`/officers/${id}/duty/stop`,{method:'POST'}),
  location:(id:string,location:any)=>request<any>(`/officers/${id}/location`,{method:'POST',body:JSON.stringify(location)}),
  arrival:(id:string,junction_id:string)=>request<any>(`/officers/${id}/arrival`,{method:'POST',body:JSON.stringify({junction_id})}),
  note:(id:string,note:string,junction_id?:string,incident_id?:string)=>request<any>(`/officers/${id}/notes`,{method:'POST',body:JSON.stringify({note,junction_id,incident_id})}),
  assignments:(id:string)=>request<any>(`/officers/${id}/assignments`),
};
