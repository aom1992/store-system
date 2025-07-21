import { Component, OnInit } from '@angular/core';
import { CalendarService } from 'src/app/service/calendar.service';
import { RestService } from 'src/app/service/rest.service';
import { Table } from 'primeng/table';
import { AlertService } from 'src/app/service/alert.service';
import { ColorService } from 'src/app/service/color.service';
import { timeout } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store-withdrawal-history',
  templateUrl: './store-withdrawal-history.component.html',
  styleUrls: ['./store-withdrawal-history.component.scss']
})
export class StoreWithdrawalHistoryComponent {
  menuLabel2: string = 'อนุมัติเบิกสินค้า > ประวัติการเบิกวัสดุสิ้นเปลือง';
  month1: Date | null = null;
  month2: Date | null = null;
  selectedType: string = 'ALL';
  showCancleButton: boolean = false;
  menuLabel: string | null = null;
  th: any;
  idcard_emp: string;


  typeData: any[] = [];
  historyData: any[] = [];

  constructor(
    private calendarService: CalendarService,
    private rest: RestService,
    private alert: AlertService,
    private color: ColorService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'];
    });

    this.th = this.calendarService.getCalendar();
    this.idcard_emp = this.auth.getDataLogin().idcard;

    this.loadWithdrawType();
    this.loadHistory();
  }

  loadWithdrawType() {
    this.rest.getWithdrawType().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {

          const allOption = {
            wt_id: 'ALL',
            wt_name: 'ทั้งหมด'
          }
          this.typeData = [allOption, ...res.data];
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
      }
    });
  }

  loadHistory() {
    this.rest.getStoreHistory().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.historyData = res.data;

          // ตรวจสอบเงื่อนไข
          this.historyData.forEach(data => {
            data.showCancleButton = (data.status_id === 'ST05' || data.status_id === 'ST06');
            data.showPrintButton = (data.status_id === 'ST07');
          });

        } else {
          console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error("มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :", error.message);
      }
    });
  }

  searchHistory() {
    if (this.month1 && this.month2) {
      const yearMonth1 = this.formatYearMonth(this.month1);
      const yearMonth2 = this.formatYearMonth(this.month2);

      const requestData = {
        month1: yearMonth1,
        month2: yearMonth2
      };

      this.rest.searchStoreHistory(requestData).pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.historyData = res.data;

            // ตรวจสอบเงื่อนไขให้กับแต่ละรายการ
            this.historyData.forEach(data => {
              data.showCancleButton = (data.status_id === 'ST05' || data.status_id === 'ST06');
              data.showPrintButton = (data.status_id === 'ST07');
            });

          } else {
            console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', res.message);
          }
        },
        error: (error) => {
          console.error("มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :", error.message);
        }
      });

    } else {
      this.alert.message('แจ้งเตือน', 'กรุณาเลือกเดือนทั้งสองช่องก่อนทำการค้นหา');
      this.loadHistory();
    }
  }

  Cancel(data: any) {
    const cancelData = {
      pw_id: data.pw_id,
      request_qty: data.request_qty,
      product_id: data.product_id,
      stock_id: data.stock_id,
      status_id: data.status_id,
      idcard: this.idcard_emp
    };

    console.log('cancelData >> ', cancelData);
    this.alert.confirm('แจ้งเตือน', 'ยืนยันการยกเลิกใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          this.rest.cancelRequest(cancelData).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              this.alert.success('สำเร็จ', res.message);
              this.loadHistory();
            },
            error: (error) => {
              console.error('Error cancelling data:', error);
            }
          });
        }
      }
    );
  }

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

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

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

  formatYearMonth(date: Date | null | undefined): string {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  getBackgroundColor(colorKey: string): string {
    return this.color.getColor(colorKey);
  }

  getTextColor(backgroundColor: string): string {
    return this.color.getTextColorForBackground(backgroundColor);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}