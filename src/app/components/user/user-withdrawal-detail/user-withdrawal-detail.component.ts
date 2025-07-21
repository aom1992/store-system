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
  selector: 'app-user-withdrawal-detail',
  templateUrl: './user-withdrawal-detail.component.html',
  styleUrls: ['./user-withdrawal-detail.component.scss'],
  providers: [MessageService]
})
export class UserWithdrawalDetailComponent implements OnInit {
  currentMenu: string | null = null;
  pw_id: string | null = null;
  tabs: { label: string, icon: string, id: string }[] = [];
  selectedTab!: { label: string, icon: string, id: string };
  visible: boolean = false;
  remarkCancel: string;

  messages: any[] = [];
  detailData: any[] = [];
  statusDetail: any[] = [];

  idcard: string;
  request_qty: string;
  stock_id: string;
  request_id: string;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private color: ColorService,
    private auth: AuthService,
    private alert: AlertService,
    private router: Router,
    public messageService: MessageService
  ) {
    this.tabs = [
      { label: 'รายละเอียดการเบิก', icon: 'pi pi-chevron-right', id: 'tab1' },
      { label: 'สถานะการดำเนินงาน', icon: 'pi pi-chevron-right', id: 'tab2' }
    ];
    this.selectedTab = this.tabs[0];
  }

  ngOnInit(): void {
    const loginData = this.auth.getDataLogin();
    this.idcard = loginData.idcard;

    this.route.queryParams.subscribe(params => {
      this.currentMenu = params['currentMenu'];
    });

    this.route.paramMap.subscribe(params => {
      this.pw_id = params.get('pw_id');
    });
    console.log('pw_id >>', this.pw_id);

    this.loadWithdrawalDetail();
    this.loadStatusDetail();
  }

  loadWithdrawalDetail() {
    this.rest.getWithdrawalDetail(this.pw_id).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.detailData = res.data;
          this.request_qty = this.detailData[0]?.request_qty;
          this.stock_id = this.detailData[0]?.stock_id;
          this.request_id = this.detailData[0]?.request_id;

        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
      },
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

  withdrawApprove() {
    this.alert.confirm('อนุมัติ', 'ต้องการอนุมัติใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          this.rest.bossApprove(this.pw_id, this.idcard, this.request_id).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alert.success('สำเร็จ', res.message).then(() => {
                  this.router.navigate(['/boss-approve']);
                });
              } else {
                console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
              }
            },
            error: (error) => {
              console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
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
      remarkCancel: this.remarkCancel,
      request_id: this.request_id
    };

    console.log('cancelData >> ', cancelData);    
    this.rest.cancelRequest(cancelData).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        this.alert.success('สำเร็จ', res.message);
        this.router.navigate(['/boss-approve']);
      },
      error: (error) => {
        console.error('Error cancelling data:', error);
      }
    });     
  }

  showCancelDialog() {
    this.visible = true;
  }

  getBackgroundColor(colorKey: string): string {
    return this.color.getColor(colorKey);
  }

  getTextColor(backgroundColor: string): string {
    return this.color.getTextColorForBackground(backgroundColor);
  }
}
