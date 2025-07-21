import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { RestService } from 'src/app/service/rest.service';
import { timeout } from 'rxjs';
import { SocketService } from 'src/app/service/socket.service';

@Component({
  selector: 'app-store-approve-detail',
  templateUrl: './store-approve-detail.component.html',
  styleUrls: ['./store-approve-detail.component.scss']
})
export class StoreApproveDetailComponent implements OnInit {
  menuLabel: string = 'สโตร์อนุมัติเบิกสินค้า';
  items: MenuItem[] = [];
  items2: MenuItem[] = [];
  items3: MenuItem[] = [];
  countStoreAprData: number = 0;
  countBossAprData: number = 0;
  countBossAprMnData: number = 0;
  badgeValue: string = '0';
  badgeValue2: string = '0';
  badgeValue3: string = '0';

  constructor(
    private router: Router,
    private rest: RestService,
    private socketService: SocketService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadCountStoreApr();
    await this.loadCountBossApr();
    await this.loadCountBossAprMn();
    this.createMenuItems();

    this.socketService.newSumStore().subscribe((count: number) => {
      console.log('📢 ข้อมูลใหม่จาก WebSocket:', count);
      this.countStoreAprData = count;
      this.badgeValue = count > 0 ? count.toString() : '';
      this.createMenuItems();
    });

    this.socketService.newSumBossApr().subscribe((count: number) => {
      console.log('📢 ข้อมูลใหม่จาก WebSocket 2:', count);
      this.countBossAprData = count;
      this.badgeValue2 = count > 0 ? count.toString() : '';
      this.createMenuItems();
    });

    this.socketService.newSumBossAprMn().subscribe((count: number) => {
      console.log('📢 ข้อมูลใหม่จาก WebSocket 3:', count);
      this.countBossAprMnData = count;
      this.badgeValue3 = count > 0 ? count.toString() : '';
      this.createMenuItems();
    });
  }


  async loadCountStoreApr(): Promise<void> {
    return new Promise((resolve) => {
      this.rest.countStoreApprove().pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.countStoreAprData = res.storeAprCount || '';
            this.badgeValue = this.countStoreAprData.toString();
          } else {
            console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
          }
          resolve();
        },
        error: (error) => {
          console.error('มีข้อผิดพลาดในการดึงข้อมูล:', error.message);
          resolve();
        },
      });
    });
  }

  async loadCountBossApr(): Promise<void> {
    return new Promise((resolve) => {
      this.rest.countBossApprove().pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.countBossAprData = res.bossAprCount || '';
            this.badgeValue2 = this.countBossAprData.toString();
            console.log('badgeValue2 : ', this.badgeValue2);
          } else {
            console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
          }
          resolve();
        },
        error: (error) => {
          console.error('มีข้อผิดพลาดในการดึงข้อมูล:', error.message);
          resolve();
        },
      });
    });
  }

  async loadCountBossAprMn(): Promise<void> {
    return new Promise((resolve) => {
      this.rest.countBossMnApprove().pipe(timeout(60000)).subscribe({
        next: (res: any) => {
          if (res.status) {
            this.countBossAprMnData = res.bossAprMnCount || '';
            this.badgeValue3 = this.countBossAprMnData.toString();
            console.log('badgeValue3 : ', this.badgeValue3);
          } else {
            console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
          }
          resolve();
        },
        error: (error) => {
          console.error('มีข้อผิดพลาดในการดึงข้อมูล:', error.message);
          resolve();
        },
      });
    });
  }

  createMenuItems(): void {
    this.items = [
      {
        label: 'รายการรอเบิกใบแจ้งซ่อม/เบิกภายใน/ผู้รับเหมา',
        icon: 'pi pi-angle-right',
        badge: this.badgeValue2,
        command: () => {
          this.router.navigate(['/store-wait-mn'], { queryParams: { menuLabel: this.menuLabel } });
        }
      },
      {
        label: 'รายการรอเบิกวัสดุสิ้นเปลือง',
        icon: 'pi pi-angle-right',
        badge: this.badgeValue3,
        command: () => {
          this.router.navigate(['/store-wait-wd'], { queryParams: { menuLabel: this.menuLabel } });
        }
      }
    ];

    this.items2 = [
      {
        label: 'รายการเบิกวัสดุสิ้นเปลือง',
        icon: 'pi pi-angle-right',
        badge: this.badgeValue,
        command: () => {
          this.router.navigate(['/store-approve'], { queryParams: { menuLabel: this.menuLabel } });
        }
      },
      {
        label: 'ประวัติการเบิกวัสดุสิ้นเปลือง',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-withdrawal-history'], { queryParams: { menuLabel: this.menuLabel } });
        }
      }
    ];

    this.items3 = [
      {
        label: 'แก้ไขข้อมูลการเบิกสินค้า',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-edit-withdrawal'], { queryParams: { menuLabel: this.menuLabel } });
        }
      }
    ];
  }

  navigate(item: MenuItem, event: MenuItemCommandEvent) {
    if (item.command) {
      item.command(event);
    }
  }
}