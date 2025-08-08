import { Component, OnInit } from '@angular/core';
import { RestService } from 'src/app/service/rest.service';
import { timeout } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-user-request',
  templateUrl: './user-request.component.html',
  styleUrl: './user-request.component.scss'
})
export class UserRequestComponent implements OnInit {

  detailData: any = {};
  withdrawData: any[] = [];
  sparepartAprData: any[] = [];
  tableData: any[] = [];
  stockData: any[] = [];
  productData: any[] = [];
  dataDepart: any[] = [];
  dataTypeWork: any[] = [];
  dataRequest: any[] = [];
  dataRequestDepart: any[] = [];
  dataApprover: any[] = [];
  dataWithdrawType: any[] = [];
  dataApprove: any[] = [];
  dataLineApprove: any[] = [];

  quantity: number = 0;
  selectedApr: any;
  selectedStock: any = null;
  selectedProduct: any;
  selectedDepart: string;
  locationUse: string;
  remarkReq: string;
  selectedType: string;
  selectedRequestId: string;
  selectedRequestIdDepart: string;
  selectedTab: string = 'ST';
  selectedLineApr: string;

  sp_id: any;
  idcard_emp: any;
  status_apr: string;
  pp_id: string;

  constructor(
    private rest: RestService,
    private auth: AuthService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    const loginData = this.auth.getDataLogin();
    this.sp_id = loginData.sp_id;
    this.idcard_emp = loginData.idcard;
    this.status_apr = loginData.status_apr;

    console.log('status_apr >> ', this.status_apr);

    this.loadDepart();
    this.loadTypeWork();
    this.loadRequestDepart();
    this.loadStock();
    this.loadWithdrawType();
    this.loadLindApprove();
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

  loadLindApprove() {
    this.rest.getLineApprove(this.status_apr).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataLineApprove = res.data;
          this.selectedLineApr = this.dataLineApprove[0].pp_id;

          this.loadApprover(this.dataLineApprove[0].pp_id);
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
          this.alert.message('แจ้งเตือน', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: ', error.message);
        this.alert.message_icon('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล', 'error');
      },
    });
  }

  onLineAprChange(pp_id: string) {
    this.selectedApr = null;
    if (pp_id) {
      this.loadApprover(pp_id);
    } else {
      this.dataApprover = [];
    }
  }

  loadApprover(pp_id: string) {
    this.rest.getApprover(pp_id, this.idcard_emp).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataApprover = res.data;
          this.selectedApr = this.dataApprover[0].idcard_apr;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
          this.alert.message('แจ้งเตือน', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: ', error.message);
        this.alert.message_icon('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล', 'error');
      },
    });
  }
  
  loadTypeWork() {
    this.rest.getTypeWork().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataTypeWork = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการดึงข้อมูล Department:', error.message);
      }
    });
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

  onTypework(tw_id: any): void {
    this.rest.getRequest(tw_id).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataRequest = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการดึงข้อมูล Department:', error.message);
      }
    });
  }

  loadStock() {
    this.rest.getStockType().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.stockData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error: any) => {
        console.error('เกิดข้อผิดพลาด:', error);
      }
    });
  }

  loadWithdrawType() {
    this.rest.getWithdrawType().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dataWithdrawType = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error: any) => {
        console.error('เกิดข้อผิดพลาด:', error);
      }
    });
  }

  onStockChange(stock_id: any): void {
    if (stock_id) {
      this.rest.getSparepart(stock_id).pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.productData = res.data;
          } else {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า:', res.message);
          }
        },
        error: (error: any) => {
          console.error('เกิดข้อผิดพลาด:', error);
        }
      });
    } else {
      this.productData = [];
    }
  }

  addProductToTable(): void {
    if (this.selectedProduct && this.quantity > 0) {
      const selectedProduct = this.productData.find(product => product.product_id === this.selectedProduct);
      if (selectedProduct) {
        this.tableData.push({
          stock_id: this.selectedStock, // เพิ่ม stock_id
          stock_name: this.stockData.find(stock => stock.stock_id === this.selectedStock)?.stock_name,
          ...selectedProduct,
          quantity: this.quantity
        });

        this.selectedStock = null;
        this.selectedProduct = null;
        this.quantity = 0;
        this.productData = [];
      }
    } else {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกสินค้าหรือใส่จำนวนให้ถูกต้อง');
    }
  }

  removeProductFromTable(index: number): void {
    this.tableData.splice(index, 1);
  }

  getSelectedWtId() {
    return this.dataWithdrawType.length > 0 ?
      this.dataWithdrawType.find(item => item.wt_id === this.selectedTab)?.wt_id || null
      : null;
  }

  saveButton() {
    console.log("selectedTab:", this.selectedTab);
    console.log("dataWithdrawType:", this.dataWithdrawType);

    if (this.selectedTab === 'ST' && (!this.selectedDepart || !this.locationUse || this.locationUse.trim() === "")) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกแผนกที่ใช้งานและระบุจุดงานที่ซ่อม !!');
      return;
    }

    if (this.selectedTab === 'SP' && (!this.selectedType || !this.selectedRequestId)) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกใบแจ้งซ่อม !!');
      return;
    }

    if (this.selectedTab === 'OP' && (!this.selectedRequestIdDepart)) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกใบแจ้งซ่อม !!');
      return;
    }

    if (this.status_apr !== 'SA99' && (!this.selectedApr || this.selectedApr.length === 0)) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกผู้อนุมัติ !!');
      return;
    }

    if (!this.tableData || this.tableData.length === 0) {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกสินค้าอย่างน้อยหนึ่งรายการ !!');
      return;
    }

    const requestData = {
      wt_id: this.getSelectedWtId(),
      depart_use: this.selectedDepart || null,
      location_use: this.locationUse || null,
      remark_req: this.remarkReq || null,
      type_work: this.selectedType || null,
      request_id: this.selectedRequestId || this.selectedRequestIdDepart || null,
      products: this.tableData,
      idcard: this.selectedApr || null,
      idcard_input: this.idcard_emp,
      status_apr: this.status_apr
    };

    this.alert.confirm('บันทึกข้อมูล', 'ต้องการบันทึกข้อมูลใช่หรือไม่ ?').then((result) => {
      if (result.isConfirmed) {
        this.rest.saveUserRequest(requestData).pipe(timeout(60000)).subscribe({
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
            const errorMsg = error.error && error.error.message ? error.error.message : error.message;
            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ', errorMsg);
            this.alert.message_icon('ข้อผิดพลาด', errorMsg || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
          },
        });
      } else {
        this.alert.message_icon('ยกเลิก', 'การบันทึกข้อมูลถูกยกเลิก', 'warning');
      }
    });
  }

  onTabChange(index: number) {
    this.selectedTab = this.dataWithdrawType[index]?.wt_id || null;
    console.log("เปลี่ยนแท็บ -> selectedTab:", this.selectedTab);

    switch (index) {
      case 0:
        this.selectedDepart = null;
        this.locationUse = '';
        this.remarkReq = '';
        break;
      case 1:
        this.selectedType = null;
        this.selectedRequestId = null;
        break;
      case 2:
        this.selectedRequestIdDepart = null;
        break;
    }
  }

  clearData() {
    this.selectedDepart = null;
    this.locationUse = '';
    this.remarkReq = '';
    this.selectedType = null;
    this.selectedRequestId = null;
    this.selectedRequestIdDepart = null;
    this.tableData = [];
  }
}