import { Component, OnInit } from '@angular/core';
import { CalendarService } from 'src/app/service/calendar.service';
import { RestService } from 'src/app/service/rest.service';
import { Table } from 'primeng/table';
import { AlertService } from 'src/app/service/alert.service';
import { ColorService } from 'src/app/service/color.service';
import { timeout } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-user-request-history',
  templateUrl: './user-request-history.component.html',
  styleUrl: './user-request-history.component.scss'
})
export class UserRequestHistoryComponent implements OnInit {
  menuLabel: string = 'ประวัติการเบิกวัสดุ';
  date1: Date | null = null;
  date2: Date | null = null;
  selectedType: string = 'ALL';
  showCancleButton: boolean = false;
  th: any;
  idcard_emp: string;

  typeData: any[] = [];
  historyData: any[] = [];

  constructor(
    private calendarService: CalendarService,
    private rest: RestService,
    private alert: AlertService,
    private color: ColorService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.th = this.calendarService.getCalendar();
    this.idcard_emp = this.auth.getDataLogin().idcard;

    this.loadWithdrawType();
    this.loadHistory();
  }

  loadWithdrawType(){
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

  loadHistory(){
    const requestData = {
      idcard_emp: this.idcard_emp
    };

    this.rest.getHistory(requestData).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.historyData = res.data;

          this.showCancleButton = this.historyData.some(data => {
            return (data.status_id === 'ST05' || data.status_id === 'ST06');
          })
        } else {
          console.error('เกิดข้อผิดพลาดในการค้นหาข้อมูล:', res.message);
        }
      },
      error: (error) => {
        console.error("มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :", error.message);
      }
    });
  }

  SearchHistory(){
    if (this.date1 && this.date2) {
      const Date1 = this.formatDate(this.date1);
      const Date2 = this.formatDate(this.date2);

      const requestData = {
        idcard_emp: this.idcard_emp,
        date1: Date1,
        date2: Date2
      };

      this.rest.searchHistory(requestData).pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.historyData = res.data;
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

  formatDate(date: Date | null | undefined): string {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
