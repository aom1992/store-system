import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-admin-setting',
  templateUrl: './admin-setting.component.html',
  styleUrls: ['./admin-setting.component.scss'],
  providers: [MessageService]
})
export class AdminSettingComponent implements OnInit {
  public header: Array<any> = [];
  public body: Array<any> = [];
  visible: boolean = false;
  showMenuTable: boolean = false;

  messages: any[] = [];
  empid: string | null = null;
  menuAccessData: any[] = [];
  menuData: any[] = [];

  user_name: string;
  selectedMenu: any;
  user_idcard: string;

  constructor(
    private messageService: MessageService,
    private rest: RestService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.loadAdminSetting();
  }

  loadAdminSetting() {
    this.rest.getAdminSetting().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.header = res.header;
          this.body = res.body;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
      }
    });
  }

  showCancelDialog(empid: string) {
    console.log('empid: ', empid);
    this.empid = empid;
    this.visible = true;
    this.loadMenuApprove(empid);
  }

  closeDialog() {
    this.visible = false;
    this.selectedMenu = [];
    this.loadAdminSetting();
  }

  onAddPermissionClick() {
    this.showMenuTable = !this.showMenuTable;
  }

  loadMenuApprove(empid: string) {
    this.rest.getMenuApprove(empid).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          const originalData = res.data;

          if (originalData.length > 0) {
            this.user_name = originalData[0].user_name;
            this.user_idcard = originalData[0].user_idcard;
          }

          this.menuAccessData = originalData.filter((item: any) => !!item.menu_id);

          this.loadMenuAccess();
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      }
    });
  }

  loadMenuAccess() {
    this.rest.getMenuAccess(this.user_idcard).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.menuData = res.data;
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
      }
    });
  }

  addMenu() {
    if (!this.selectedMenu || this.selectedMenu.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'แจ้งเตือน', detail: 'กรุณาเลือกเมนูก่อนทำการเพิ่ม !!', life: 3000 });
      return;
    }
  
    const menuIds = this.selectedMenu.map((item: any) => item.menu_id);
  
    this.rest.addMenuAccess(this.user_name, this.user_idcard, menuIds).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'เพิ่มสิทธิ์เมนูเรียบร้อยแล้ว !!', life: 3000 });
          this.loadMenuApprove(this.empid);
        } else {
          this.alert.message('แจ้งเตือน', 'เพิ่มเมนูล้มเหลว: ' + res.message);
        }
      },
      error: (err) => {
        this.alert.message('แจ้งเตือน', 'เกิดข้อผิดพลาด: ' + err.message);
      }
    });
  }

  deleteMenu(user_idcard: string, menu_id: string){
    this.rest.deleteMenuAccess(user_idcard, menu_id).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'ลบเมนูเรียบร้อยแล้ว !!', life: 3000 });
          this.loadMenuApprove(this.empid);
        } else {
          this.alert.message('แจ้งเตือน', 'เพิ่มเมนูล้มเหลว: ' + res.message);
        }
      },
      error: (err) => {
        this.alert.message('แจ้งเตือน', 'เกิดข้อผิดพลาด: ' + err.message);
      }
    });
  }
}