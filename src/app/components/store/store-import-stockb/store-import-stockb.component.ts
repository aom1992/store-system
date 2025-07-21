import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/service/rest.service';
import { timeout } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-store-import-stockb',
  templateUrl: './store-import-stockb.component.html',
  styleUrl: './store-import-stockb.component.scss'
})
export class StoreImportStockbComponent implements OnInit {
  menuLabel: string | null = null;
  date: Date = new Date();
  dateReceived: Date | undefined;

  quantity: number = 0;
  tableData: any[] = [];
  productGroupData: any[] = [];
  unitData: any[] = [];
  empData: any[] = [];
  dataRequestDepart: any[] = [];

  selectedProductGroup: string;
  selectedUnit: string;
  productNumber: string;
  productDetail: string;
  selectedRequestIdDepart: string;
  poNumber: string;
  empRequest: string;
  idcard: string;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private auth: AuthService,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'] || 'Default Label';
    });

    this.idcard = this.auth.getDataLogin().idcard
    console.log('idcard :', this.idcard);

    this.loadAllEmployee();
    this.loadRequestDepart();
    this.loadProductGroup();
    this.loadProductUnit();
  }

  loadRequestDepart() {
    this.rest.getRequestDepart().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataRequestDepart = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการดึงข้อมูล Department:', error.message);
      }
    });
  }

  loadAllEmployee() {
    this.rest.getAllEmployee().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.empData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
    });
  }

  loadProductGroup() {
    this.rest.getProductGroup().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.productGroupData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
    });
  }

  loadProductUnit() {
    this.rest.getProductUnit().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.unitData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
    });
  }

  addProductToTable(): void {
    // ตรวจสอบว่าค่าทั้งหมดถูกต้องก่อนเพิ่ม
    if (!this.selectedProductGroup) {
      this.alert.message("แจ้งเตือน", "กรุณาเลือกกลุ่มสินค้า");
      return;
    }
    if (!this.productDetail || this.productDetail.trim() === "") {
      this.alert.message("แจ้งเตือน", "กรุณากรอกรายการสินค้า");
      return;
    }
    if (this.quantity === null || this.quantity === undefined || this.quantity <= 0) {
      this.alert.message("แจ้งเตือน", "กรุณากรอกจำนวนรับเข้าให้ถูกต้อง");
      return;
    }
    if (!this.selectedUnit) {
      this.alert.message("แจ้งเตือน", "กรุณาเลือกหน่วยนับ");
      return;
    }

    this.tableData.push({
      product_group: this.productGroupData.find(pg => pg.pg_id === this.selectedProductGroup)?.pg_name || "",
      product_number: this.productNumber,
      product_detail: this.productDetail,
      quantity: this.quantity,
      unit: this.unitData.find(unit => unit.pu_id === this.selectedUnit)?.pu_name || ""
    });

    this.selectedProductGroup = null;
    this.productNumber = "";
    this.productDetail = "";
    this.quantity = null;
    this.selectedUnit = null;
  }

  saveButton() {
    if (!this.dateReceived) {
      this.alert.message('แจ้งเตือน', 'กรุณากรอกวันที่รับสินค้า');
      return;
    }
    if (!this.tableData || this.tableData.length === 0) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกสินค้าอย่างน้อยหนึ่งรายการ !!');
      return;
    }
  
    const productData = {
      date_received: this.formatDate(this.dateReceived),
      po_number: this.poNumber,
      request_id: this.selectedRequestIdDepart,
      emp_request: this.empRequest,
      products: this.tableData.map(item => ({
        product_group: this.productGroupData.find(pg => pg.pg_name === item.product_group)?.pg_id || "",  // แปลงชื่อเป็น pg_id
        product_number: item.product_number,
        product_detail: item.product_detail,
        quantity: item.quantity,
        unit: this.unitData.find(unit => unit.pu_name === item.unit)?.pu_id || ""  // แปลงชื่อเป็น pu_id
      })),
      idcard: this.idcard
    };
  
    // แสดง Alert ยืนยันก่อนบันทึก
    this.alert.confirm('บันทึกข้อมูล', 'ต้องการบันทึกข้อมูลใช่หรือไม่ ?').then((result) => {
      if (result.isConfirmed) {
        this.rest.saveStockB(productData).pipe(timeout(60000)).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.alert.success('สำเร็จ', res.message).then(() => {
                this.clearData();
              });
            } else {
              this.alert.message_icon('ผลการทำงาน', res.message, 'error');
            }
          },
          error: (error) => {
            this.alert.message_icon('ผลการทำงาน', error.message, 'error');
          }
        });
      }
    });
  }
  

  clearData() {
    this.dateReceived = null;
    this.poNumber = null;
    this.selectedRequestIdDepart = null;
    this.empRequest = null;
    this.idcard = null;
    
    // เคลียร์ตารางสินค้า
    this.tableData = [];
  
    // รีเซ็ตค่าที่ใช้เพิ่มสินค้าใหม่
    this.selectedProductGroup = null;
    this.productNumber = '';
    this.productDetail = '';
    this.quantity = null;
    this.selectedUnit = null;
  }
  

  formatDate(date: Date): string {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  removeProductFromTable(index: number): void {
    this.tableData.splice(index, 1);
  }
}
