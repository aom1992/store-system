import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { ColorService } from 'src/app/service/color.service';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-store-approve-product',
  templateUrl: './store-approve-product.component.html',
  styleUrls: ['./store-approve-product.component.scss'],
  providers: [MessageService]
})
export class StoreApproveProductComponent implements OnInit {
  menuLabel2: string = '> ตรวจสอบข้อมูลสินค้า > รายการสินค้าทั้งหมด STOCK A/B';
  menuLabel: string | null = null;
  pw_id: string | null = null;
  tabs: { label: string, icon: string, id: string }[] = [];
  selectedTab!: { label: string, icon: string, id: string };
  visible: boolean = false;
  selectAll: boolean = false;

  messages: any[] = [];
  detailData: any[] = [];
  statusDetail: any[] = [];
  empData: any[] = [];
  idcard: string;
  selectedEmp: string;
  remarkCancel: string;

  constructor(
    private route: ActivatedRoute,
    private color: ColorService,
    private rest: RestService,
    private auth: AuthService,
    private router: Router,
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
 
    this.initData();
  }

  initData() {
    this.loadStatusDetail();
    this.loadAllEmployee();
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

  loadAllEmployee() {
    this.rest.getAllEmployee().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.empData = res.data;
          this.loadWithdrawalDetail();
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

  Cancel(pw_id: any) {
    if (!this.remarkCancel) {
      this.messageService.add({ severity: 'error', summary: 'แจ้งเตือน', detail: 'ระบุสาเหตุการยกเลิก !!', life: 3000 });
      return;
    }

    const productIds = this.detailData.map(item => item.product_id).join(', ');
    const requestQtys = this.detailData.map(item => item.request_qty).join(', ');
    const stockIds = this.detailData.map(item => item.stock_id).join(', ');
    const cancelData = {
      pw_id: pw_id,
      request_qty: requestQtys,
      product_id: productIds,
      stock_id: stockIds,
      idcard: this.idcard,
      remarkCancel: this.remarkCancel
    };

    console.log('cancelData >> ', cancelData);
    this.rest.cancelRequest(cancelData).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        this.alert.success('สำเร็จ', res.message);
        this.router.navigate(['/store-approve']);
      },
      error: (error) => {
        console.error('Error cancelling data:', error);
      }
    });
  }

  showCancelDialog() {
    this.visible = true;
  }

  withdrawApprove(request_id: string) {
    const selectedRows = this.detailData.filter(row => row.selected);
  
    if (selectedRows.length === 0) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกอย่างน้อยหนึ่งรายการ');
      return;
    }
  
    for (let row of selectedRows) {
      if (
        row.realWithdrawal === null || row.realWithdrawal === undefined ||
        row.selectedEmp === null || row.selectedEmp === undefined
      ) {
        this.alert.message('แจ้งเตือน', 'กรุณากรอกจำนวนเบิกจริงและเลือกผู้เบิกให้ครบทุกแถว');
        return;
      }
  
      const alreadyWithdrawn = Number(row.withdraw_qty || 0);
      const requestQty = Number(row.request_qty || 0);
      const thisWithdraw = Number(row.realWithdrawal || 0);
  
      if (thisWithdraw > requestQty) {
        this.alert.message('แจ้งเตือน', `จำนวนเบิก (${thisWithdraw}) มากกว่าที่ร้องขอ (${requestQty})`);
        return;
      }
  
      if (alreadyWithdrawn + thisWithdraw > requestQty) {
        this.alert.message('แจ้งเตือน', `จำนวนเบิก (รวม ${alreadyWithdrawn + thisWithdraw}) มากกว่าที่ร้องขอ (${requestQty})`);
        return;
      }
    }
  
    const requestData = selectedRows.map(row => ({
      pw_id: row.pw_id,
      product_id: row.product_id,
      stock_id: row.stock_id,
      request_qty: row.request_qty,
      realWithdrawal: row.realWithdrawal,
      selectedEmp: row.selectedEmp,
      idcard: this.idcard,
      request_id: request_id
    }));
  
    console.log('requestData >> ', requestData);
  
    this.rest.storeSeveWithdrawal(requestData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.alert.success('สำเร็จ', res.message);
          this.initData();
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

  toggleAllCheckboxes(event: any) {
    const checked = event.checked;
    this.detailData.forEach(item => {
      if (!this.isFullyWithdrawn(item)) {
        item.selected = checked;
      }
    });
  }

  isFullyWithdrawn(data: any): boolean {
    const withdraw = Number(data.withdraw_qty || 0);
    const request = Number(data.request_qty || 0);
    return withdraw >= request;
  } 

  // toggleAllCheckboxes(event: any) {
  //   const isChecked = event.target.checked;
  //   this.detailData.forEach(data => {
  //     data.selected = isChecked;
  //   });
  // }

  printPDF(pw_id: string) {
    const fileName = `ใบเบิก_${pw_id}.pdf`;
    this.rest.getPDF(pw_id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const newTab = window.open(url, '_blank');
        if (newTab) {
          newTab.document.title = fileName;
          newTab.focus();
        } else {
          console.error('Failed to open new tab for the PDF');
        }

        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error while generating PDF:', error);
      },
      complete: () => {
        console.log('PDF generation complete.');
      }
    });
  }  

  onCheckboxChange() {
    this.selectAll = this.detailData.every(data => data.selected);
  }

  getBackgroundColor(colorKey: string): string {
    return this.color.getColor(colorKey);
  }

  getTextColor(backgroundColor: string): string {
    return this.color.getTextColorForBackground(backgroundColor);
  }
}
