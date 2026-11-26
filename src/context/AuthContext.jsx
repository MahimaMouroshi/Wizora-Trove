import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){ const [user,setUser]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{ if(localStorage.getItem('wizora_token')) auth.me().then(r=>setUser(r.data?.user||r.data)).catch(()=>localStorage.removeItem('wizora_token')).finally(()=>setLoading(false)); else setLoading(false)},[]);
 const login=async data=>{const r=await auth.login(data); const token=r.data?.token||r.data?.data?.token; if(token)localStorage.setItem('wizora_token',token); setUser(r.data?.user||r.data?.data?.user); return r};
 const logout=()=>{localStorage.removeItem('wizora_token');setUser(null)};
 return <AuthContext.Provider value={{user,setUser,login,logout,loading}}>{children}</AuthContext.Provider> }
export const useAuth=()=>useContext(AuthContext);
