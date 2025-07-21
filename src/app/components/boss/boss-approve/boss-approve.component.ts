import { Component, OnInit } from '@angular/core';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { Table } from 'primeng/table';
import { ColorService } from 'src/app/service/color.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-boss-approve',
  templateUrl: './boss-approve.component.html',
  styleUrl: './boss-approve.component.scss'
})
export class BossApproveComponent implements OnInit {
  menuLabel: string = 'อนุมัติเบิกสินค้า';
  requestData: any[] = [];

  idcard: string;

  constructor(
    private color: ColorService,
    private rest: RestService,
    private auth: AuthService
  ){}

  ngOnInit(): void {
    const loginData = this.auth.getDataLogin();
    this.idcard = loginData.idcard;
    this.loadWaitApprove();
  }

  loadWaitApprove(){
    this.rest.getBossApprove(this.idcard).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.requestData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', res.message);
        }
      },
      error: (error: any) => {
        console.error('เกิดข้อผิดพลาด:', error);
      },
    });
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
