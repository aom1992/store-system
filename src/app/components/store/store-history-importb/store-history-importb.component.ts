import { Component, OnInit } from '@angular/core';
import { RestService } from 'src/app/service/rest.service';
import { Table } from 'primeng/table';
import { AlertService } from 'src/app/service/alert.service';
import { timeout } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-store-history-importb',
  templateUrl: './store-history-importb.component.html',
  styleUrl: './store-history-importb.component.scss'
})
export class StoreHistoryImportbComponent implements OnInit {
  menuLabel: string | null = null;
  menuLabel2: string = `ตรวจสอบข้อมูลสินค้า > ประวัติการรับเข้า (STOCK B)`;
  historyData: any[] = [];

  idcard: string;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private alert: AlertService,
    private auth: AuthService,
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'] || 'Default Label';
    });

    const loginData = this.auth.getDataLogin();
    this.idcard = loginData.idcard;

    this.loadProductImport();
  }

  loadProductImport(){
    this.rest.getProductImportB().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.historyData = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
      }
    })
  }

  deleteProduct(date_input: string, stock_id: string) {
    this.alert.cancel('แจ้งเตือน', 'ต้องการลบข้อมูลใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          const productData = {
            date_input: this.formatDateToYYYYMMDD(date_input),
            stock_id,
            idcard: this.idcard
          }

          this.rest.deleteProductImportB(productData).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alert.success('สำเร็จ', res.message);
                this.loadProductImport();
              }
            },
            error: (error: any) => {
              console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย:', error.message);
            }
          });
        }
      }
    );
  }

  formatDateToYYYYMMDD(date: string): string {
    const parts = date.split('-'); // แยกวัน เดือน ปี
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // แปลงเป็น YYYY-MM-DD
    }
    return date; // ถ้า format ไม่ถูกต้องให้ใช้ค่าเดิม
  }
  

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
