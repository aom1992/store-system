import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  public saveLogin(token: string) {
    return new Promise((resolve, reject) => {
      localStorage.setItem('token', token);
      resolve(true);
    });
  }

  public getDataLogin(){
    let token: any = localStorage.getItem('token');
    let JWT_DECODE: any = jwtDecode<JwtPayload>(token);
    const { empid, name, depart, idcard, id_depart, position, sp_id, p_id, pp_id, status_apr } = JWT_DECODE;
    return {
      empid: empid,
      name: name,
      idcard: idcard,
      depart: depart,
      id_depart: id_depart,
      position: position,
      sp_id: sp_id,
      p_id: p_id,
      pp_id: pp_id,
      status_apr: status_apr
    };
  }

  public getToken() {
    let token: any = localStorage.getItem('token');
    return token;
  }

  public isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  public logOut() {
    localStorage.clear();
    return true;
  }
}