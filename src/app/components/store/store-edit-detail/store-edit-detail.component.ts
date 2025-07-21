import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { ColorService } from 'src/app/service/color.service';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-store-edit-detail',
  templateUrl: './store-edit-detail.component.html',
  styleUrls: ['./store-edit-detail.component.scss'],
  providers: [MessageService]
})
export class StoreEditDetailComponent implements OnInit {
  menuLabel: string | null = null;
  pw_id: string | null = null;
  tabs: { label: string, icon: string, id: string }[] = [];
  selectedTab!: { label: string, icon: string, id: string };
  selectedProduct: any = null;
  idcard: string;
  remarkCancel: string;
  editQty: string;
  departUse: string;
  locationUse: string;

  messages: any[] = [];
  detailData: any[] = [];
  empData: any[] = [];
  statusDetail: any[] = [];
  dataDepart: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private color: ColorService,
    private rest: RestService,
    private auth: AuthService,
    private alert: AlertService,
    public messageService: MessageService
  ) {
    this.tabs = [
      { label: 'รายละเอียดการเบิก', icon: 'pi pi-chevron-right', id: 'tab1' },
      { label: 'สถานะการดำเนินงาน', icon: 'pi pi-chevron-right', id: 'tab2' }
    ];
    this.selectedTab = this.tabs[0];
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.pw_id = params.get('pw_id');
    });

    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['currentMenu'];
    });
    const loginData = this.auth.getDataLogin();
    this.idcard = loginData.idcard;

    console.log('pw_id >> ', this.pw_id);

    this.loadWithdrawalDetail();
    this.loadStatusDetail();
    this.loadDepart();
  }

  loadDepart() {
    this.rest.getDepart().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataDepart = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการดึงข้อมูล Department:', error.message);
      }
    });
  }

  loadStatusDetail() {
    this.rest.getStatusDetail(this.pw_id).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.statusDetail = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
    });
  }

  loadWithdrawalDetail() {
    this.rest.getWithdrawalDetail(this.pw_id).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.detailData = res.data.map((item: any) => {
            const matchedEmp = this.empData?.find(emp => emp.idcard_emp === item.withdraw_idcard);

            return {
              ...item,
              selectedEmp: matchedEmp ? matchedEmp.idcard_emp : null,
              realWithdrawal: null
            };
          });
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
    });
  }

  editProduct(product: any) {
    this.selectedProduct = { ...product, edit_qty: product.request_qty };
  }

  saveEdit(product_id: string, stock_id: string) {
    if (!this.editQty && !this.departUse && !this.locationUse) {
      this.alert.message('แจ้งเตือน', 'กรุณากรอกข้อมูลอย่างน้อย 1 ช่อง');
      return;
    }

    if (this.editQty > this.selectedProduct.request_qty) {
      this.alert.message('แจ้งเตือน', 'จำนวนคืนสินค้าเกินกว่าจำนวนขอเบิก');
      return;
    }

    if (this.editQty === this.selectedProduct.request_qty) {
      this.alert.message('แจ้งเตือน', 'ให้ลบสินค้าแทนการคืนสินค้าทั้งหมด');
      return;
    }

    this.alert.confirm('แจ้งเตือน', 'ต้องการแก้ไขข้อมูลใช่หรือไม่?').then((result) => {
      if (result.isConfirmed) {
        let productData: any = {
          pw_id: this.pw_id,
          product_id: product_id,
          stock_id: stock_id,
          idcard: this.idcard
        };

        if (this.editQty) productData.editQty = this.editQty;
        if (this.departUse) productData.departUse = this.departUse;
        if (this.locationUse) productData.locationUse = this.locationUse;

        console.log('productData ที่ส่งไป:', productData);

        this.rest.storeEditProduct(productData).pipe(timeout(60000)).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alert.success('สำเร็จ', 'แก้ไขข้อมูลสำเร็จ');
              this.loadWithdrawalDetail();
              this.loadStatusDetail();
              this.clearData();
            } else {
              this.alert.message('แจ้งเตือน', res.message);
            }
          },
          error: (error: any) => {
            const errMsg = error?.error?.message || 'เกิดข้อผิดพลาดในการบันทึก';
            this.alert.message('แจ้งเตือน', errMsg);
          }
        });
      }
    });
  }

  deleteProduct(pw_id: string, product_id: string, request_qty: number, stock_id: string) {
    this.alert.cancel('แจ้งเตือน', 'ต้องการลบข้อมูลใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          const productData = {
            pw_id: pw_id,
            product_id: product_id,
            request_qty: request_qty,
            stock_id: stock_id,
            idcard: this.idcard
          }

          this.rest.storeDeleteProduct(productData).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alert.success('สำเร็จ', 'ลบสินค้าสำเร็จ');
                this.loadWithdrawalDetail();
                this.clearData();
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

  clearData(){
    this.selectedProduct = null;
    this.editQty = null;
    this.departUse = null;
    this.locationUse = null;
  }

  getBackgroundColor(colorKey: string): string {
    return this.color.getColor(colorKey);
  }

  getTextColor(backgroundColor: string): string {
    return this.color.getTextColorForBackground(backgroundColor);
  }
}
