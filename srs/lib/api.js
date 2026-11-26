import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 12000 });
api.interceptors.request.use(config => { const token = localStorage.getItem('wizora_token'); if(token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const auth = {
 register: data => api.post('/auth/register', data),
 login: data => api.post('/auth/login', data),
 me: () => api.get('/auth/me'),
 update: data => api.patch('/auth/profile', data)
};
export const library = { list: params => api.get('/library', {params}), get: id => api.get(`/library/${id}`), status:()=>api.get('/library/member/status'), rentals:()=>api.get('/library/member/rentals'), rent:id=>api.post(`/library/${id}/rent`), returnBook:(id,data)=>api.post(`/library/rentals/${id}/return`,data) };
export const membership = { plans:()=>api.get('/membership/plans'), request:plan=>api.post('/membership/request',{plan}), security:()=>api.get('/membership/security') };
export const profile = { dashboard:()=>api.get('/profile/dashboard'), reading:data=>api.post('/profile/reading-log',data) };
export const requests = { mine:()=>api.get('/requests/mine'), create:data=>api.post('/requests',data) };
export const ratings = { get:id=>api.get(`/ratings/${id}`), add:(id,data)=>api.post(`/ratings/${id}`,data) };
export const marketplace = { list:params=>api.get('/decutler',{params}), mine:()=>api.get('/decutler/mine'), create:data=>api.post('/decutler',data), reserve:id=>api.post(`/decutler/${id}/reserve`) };
export const restoration = { create:data=>api.post('/restoration',data), mine:()=>api.get('/restoration/mine') };
export const orders = { create:data=>api.post('/orders/store',data), mine:()=>api.get('/orders/mine') };
export const blindDate = { create:data=>api.post('/blind-date',data), mine:()=>api.get('/blind-date/mine'), options:params=>api.get('/blind-date/options',{params}) };
export const admin = { stats:()=>api.get('/admin/stats'), users:()=>api.get('/admin/users'), updateUser:(id,data)=>api.patch(`/admin/users/${id}`,data), rentals:()=>api.get('/admin/rentals'), books:()=>api.get('/admin/books'), requests:()=>api.get('/requests/admin/all'), updateRequest:(id,data)=>api.patch(`/requests/admin/${id}`,data), listings:()=>api.get('/admin/decutler'), orders:()=>api.get('/admin/orders'), updateOrder:(id,data)=>api.patch(`/admin/orders/${id}`,data), restorations:()=>api.get('/admin/restorations'), updateRestoration:(id,data)=>api.patch(`/admin/restorations/${id}`,data), blindDates:()=>api.get('/admin/blind-date'), updateBlindDate:(id,data)=>api.patch(`/admin/blind-date/${id}`,data), blindDateOptions:()=>api.get('/admin/blind-date/options'), createBlindDateOption:data=>api.post('/admin/blind-date/options',data), deleteBlindDateOption:id=>api.delete(`/admin/blind-date/options/${id}`), createBook:data=>api.post('/admin/books',data), updateBook:(id,data)=>api.patch(`/admin/books/${id}`,data), deleteBook:id=>api.delete(`/admin/books/${id}`), activateMembership:data=>api.post('/admin/memberships/activate',data) };
export default api;