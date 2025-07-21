import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { Table } from 'primeng/table';
import { ColorService } from 'src/app/service/color.service';


@Component({
  selector: 'app-store-wait-wd',
  templateUrl: './store-wait-wd.component.html',
  styleUrl: './store-wait-wd.component.scss'
})
export class StoreWaitWdComponent implements OnInit {
  menuLabel2: string = 'อนุมัติเบิกสินค้า -> รายการรอเบิกวัสดุสิ้นเปลือง';
  menuLabel: string | null = null;
  requestData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private color: ColorService,
    private rest: RestService
  ){}

  ngOnInit(): void {    
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'];
    });

    this.loadWaitApprove();
  }

  loadWaitApprove(){
    this.rest.getWaitWdApprove().pipe(timeout(60000)).subscribe({
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
