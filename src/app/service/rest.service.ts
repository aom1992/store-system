import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  private headers = new HttpHeaders({ "Content-Type": "application/json" });
  private hostUrl = environment.apiUrl;
  private loginUrl = `${this.hostUrl}api/login`;
  private menuUrl = `${this.hostUrl}api/menu`;
  private stsUrl = `${this.hostUrl}api/sts`;
  private countUrl = `${this.hostUrl}api/counts`;
  private excelUrl = `${this.hostUrl}api/excel`;

  constructor(
    private http: HttpClient,
  ) { }

  login(username: string, password: string) {
    this.headers = new HttpHeaders({ "Content-Type": "application/json" });
    const body = {
      username: username,
      password: password
    }
    return this.http.post<any>(`${this.loginUrl}/login-green`, body, { headers: this.headers });
  }

  getMenuByIdCard( idcard: string ): Observable<any> {
    const body = { 
      idcard: idcard
    };
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    return this.http.post<any>(`${this.menuUrl}/menu`, body,{ headers: this.headers });
  }

  getPDF(pw_id: string): Observable<Blob> {
    const url = `${this.hostUrl}generate-pdf/${pw_id}`;
    return this.http.get(url, { responseType: 'blob' });
  }  

  generateStockPDF(stockData: any, type: string): Observable<Blob> {
    const url = `${this.hostUrl}generate-stock-pdf`;
    return this.http.post(url, { stockData, type }, { responseType: 'blob' });
  }

  countStoreApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.countUrl}/countStoreApprove`, {}, { headers: this.headers });
  }

  countBossApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.countUrl}/countBossApprove`, {}, { headers: this.headers });
  }

  countBossMnApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.countUrl}/countBossApproveMn`, {}, { headers: this.headers });
  }

  countBossAprWithdrawal(idcard: string): Observable<any[]> {
    const body = { idcard: idcard };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.countUrl}/countBossAprWithdrawal`, body, { headers: this.headers });
  }

  getDepart(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-depart`, { headers: this.headers });
  }

  getTypeWork(): Observable<any[]> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-typework`, {}, { headers });
  }

  getRequest(tw_id: any): Observable<any[]> {
    const body = { tw_id: tw_id };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-request`, body, { headers: this.headers });
  }

  getRequestDepart(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-request-depart`, {}, { headers: this.headers });
  }

  getApprover(selectedLineApr: any, idcard_emp: any): Observable<any[]> {
    const body = { 
      pp_id: selectedLineApr,
      idcard_emp: idcard_emp
    };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-approver`, body, { headers: this.headers });
  }

  getSparepart(stock_id: any): Observable<any[]> {
    const body = { stock_id };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-sparepart`, body, { headers: this.headers });
  }

  getStockType(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-stock-type`, {}, { headers: this.headers });
  }

  getWithdrawType(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-withdraw-type`, {}, { headers: this.headers });
  }

  saveUserRequest(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/save-user-request`, body, { headers: this.headers });
  }

  getHistory(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-history`, body, { headers: this.headers });
  }

  searchHistory(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/search-history`, body, { headers: this.headers });
  }

  getWithdrawalDetail(pw_id: any): Observable<any[]> {
    const body = { pw_id };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-withdrawal-detail`, body, { headers: this.headers });
  }

  getStatusDetail(pw_id: any): Observable<any[]> {
    const body = { pw_id };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-status-detail`, body, { headers: this.headers });
  }

  cancelRequest(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/cancel-request`, body, { headers: this.headers });
  }

  getStoreHistory(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-store-history`, {}, { headers: this.headers });
  }

  searchStoreHistory(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/search-store-history`, body, { headers: this.headers });
  }

  getStoreApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-store-approve`, {}, { headers: this.headers });
  }

  getAllEmployee(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-allemployee`, {}, { headers: this.headers });
  }

  getWaitApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-waitmn-approve`, {}, { headers: this.headers });
  }

  getWaitWdApprove(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-waitwd-approve`, {}, { headers: this.headers });
  }

  getBossApprove(idcard: string): Observable<any[]> {
    const body = { idcard: idcard };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-boss-approve`, body, { headers: this.headers });
  }

  bossApprove(pw_id: string, idcard: string, request_id: string): Observable<any[]> {
    const body = {
      pw_id: pw_id,
      idcard: idcard,
      request_id: request_id
    };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/boss-approve`, body, { headers: this.headers });
  }

  getBossaprHistory(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-bossapr-history`, body, { headers: this.headers });
  }

  searchBossaprHistory(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/search-bossapr-history`, body, { headers: this.headers });
  }

  storeDeleteProduct(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/store-delete-product`, body, { headers: this.headers });
  }

  storeSeveWithdrawal(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/store-save-withdrawal`, body, { headers: this.headers });
  }

  storeEditProduct(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/store-edit-product`, body, { headers: this.headers });
  }

  getProductImport(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.excelUrl}/get-product-import`, {}, { headers: this.headers });
  }

  deleteProductImport(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.excelUrl}/delete-product-import`, body, { headers: this.headers });
  }

  getProductDetail(date_input: string): Observable<any[]> {
    const body = {
      date_input: date_input,
    };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.excelUrl}/get-product-detail`, body, { headers: this.headers });
  }

  deleteProduct(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.excelUrl}/delete-product`, body, { headers: this.headers });
  }

  getProductGroup(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-product-group`, {}, { headers: this.headers });
  }

  getProductUnit(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-product-unit`, {}, { headers: this.headers });
  }

  saveStockB(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/save-product-stockb`, body, { headers: this.headers });
  }

  getProductImportB(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-product-importb`, {}, { headers: this.headers });
  }

  deleteProductImportB(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/delete-product-importb`, body, { headers: this.headers });
  }

  getProductB(date_input: string): Observable<any> {
    const body = {
      date_input: date_input,
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.stsUrl}/get-productb`, body, { headers });
  }

  deleteProductB(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/delete-productb`, body, { headers: this.headers });
  }

  getAllProductDetail(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-allproduct-detail`, {}, { headers: this.headers });
  }

  updateProductStatus(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/update-product-status`, body, { headers: this.headers });
  }

  updateProductRemain(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/update-product-remain`, body, { headers: this.headers });
  }

  getAdminSetting(): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-admin-setting`, {}, { headers: this.headers });
  }

  updateStatusUsage(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/update-status-usage`, body, { headers: this.headers });
  }

  getCheckProduct(product_id: string): Observable<any[]> {
    const body = { product_id };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-check-product`, body, { headers: this.headers });
  }

  getLineApprove(status_apr: string): Observable<any[]> {
    const body = { status_apr };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-line-approve`, body, { headers: this.headers });
  }

  getMenuApprove(empid: string): Observable<any[]> {
    const body = { empid };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-menu-approve`, body, { headers: this.headers });
  }

  getMenuAccess(user_idcard: string): Observable<any[]> {
    const body = { user_idcard };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/get-menu-access`, body, { headers: this.headers });
  }

  addMenuAccess(user_name: string, idcard: string, menuIds: string[]): Observable<any[]> {
    const body = { 
      user_name: user_name,
      user_idcard: idcard,
      menu_ids: menuIds
    };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/add-menu-access`, body, { headers: this.headers });
  }

  deleteMenuAccess(user_idcard: string, menu_id: string): Observable<any[]> {
    const body = { 
      user_idcard: user_idcard,
      menu_id: menu_id
    };
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.stsUrl}/delete-menu-access`, body, { headers: this.headers });
  }

  getCountTopbar(body: any): Observable<any[]> {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
    return this.http.post<any[]>(`${this.countUrl}/count-topbar`, body, { headers: this.headers });
  }
  
}