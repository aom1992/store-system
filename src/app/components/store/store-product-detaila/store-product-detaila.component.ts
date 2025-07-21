import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Table } from 'primeng/table';
import { AlertService } from 'src/app/service/alert.service';
import { RestService } from 'src/app/service/rest.service';
import { AuthService } from 'src/app/service/auth.service';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-store-product-detaila',
  templateUrl: './store-product-detaila.component.html',
  styleUrl: './store-product-detaila.component.scss'
})
export class StoreProductDetailaComponent implements OnInit {
  menuLabel: string | null = null;
  date_input: string | null = null;
  productData: any[] = [];

  idcard: string;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private auth: AuthService,
    private alert: AlertService
  ){}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.date_input = params.get('date_input');
    });

    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['currentMenu'] || 'Default Label';
    });

    this.idcard = this.auth.getDataLogin().idcard;

    this.loadProduct();
  }

  loadProduct(){
    this.rest.getProductDetail(this.date_input).pipe(timeout(6000)).subscribe({
      next: (res: any) => {
        if ( res.success ) {
          this.productData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error: any) => {
        console.error('เกิดข้อผิดพลาด: ', error);
      }
    });
  }

  deleteProduct(id: number, product_id: string, product_received: string, stock_id: string) {
    this.alert.cancel('แจ้งเตือน', 'ต้องการลบข้อมูลใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          const productData = {
            id,
            product_id,
            product_received,
            stock_id,
            idcard: this.idcard
          }

          this.rest.deleteProduct(productData).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alert.success('สำเร็จ', res.message);
                this.loadProduct();
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

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
