import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { timeout } from 'rxjs';
import { RestService } from 'src/app/service/rest.service';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';

@Component({
  selector: 'app-store-check-stock',
  templateUrl: './store-check-stock.component.html',
  styleUrls: ['./store-check-stock.component.scss'],
  providers: [MessageService]
})
export class StoreCheckStockComponent implements OnInit {
  stateOptions: any[] = [{ label: 'off', value: 'off' }, { label: 'on', value: 'on' }];
  menuLabel: string | null = null;
  menuLabel2: string = '> ตรวจสอบข้อมูลสินค้า > รายการสินค้าทั้งหมด STOCK A/B'
  items: MenuItem[] = [];
  activeItem!: MenuItem;
  visible: boolean = false;

  messages: any[] = [];
  stockAData: any[] = [];
  stockBData: any[] = [];

  productId: string;
  productDetail: string;
  productRemain: string;
  productEdit: string;
  Id: string;
  idcard: string;
  stockId: string;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private messageService: MessageService,
    private auth: AuthService,
    private alert: AlertService
  ) {
    this.items = [
      { label: 'STOCK A', icon: 'pi pi-chevron-right', id: 'tab1' },
      { label: 'STOCK B', icon: 'pi pi-chevron-right', id: 'tab2' }
    ];
    this.activeItem = this.items[0]; // ตั้งค่าเริ่มต้นที่ 'STOCK A'
  }

  ngOnInit(): void {
    this.idcard = this.auth.getDataLogin().idcard;
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'];
    });

    this.loadProductImport();
  }

  loadProductImport() {
    this.rest.getAllProductDetail().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.stockAData = res.stocka.map((item: any) => ({
            ...item,
            status_usage: item.status_usage === 'open' ? 'on' : 'off'
          }));
          this.stockBData = res.stockb.map((item: any) => ({
            ...item,
            status_usage: item.status_usage === 'open' ? 'on' : 'off'
          }));
        } else {
          console.log('ดึงข้อมูลไม่สำเร็จ: ', res.message);
        }
      },
      error: (error) => {
        console.error('มีข้อผิดพลาดในการเชื่อมต่อเครือข่าย :', error.message);
      }
    })
  }

  changeStatus(data: any, newStatus: string) {
    const updatedData = {
      id: data.id,
      status_usage: newStatus === 'on' ? 'open' : 'close'
    };

    this.rest.updateProductStatus(updatedData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'เปลี่ยนสถานะเรียบร้อยแล้ว' });
          data.status_usage = newStatus;
        } else {
          this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'ไม่สามารถเปลี่ยนสถานะได้' });
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'มีข้อผิดพลาดในการเชื่อมต่อ' });
        console.error('Error updating status:', error);
      }
    });
  }

  editProductQty(Id: any) {
    if (!this.productEdit) {
      this.messageService.add({ severity: 'error', summary: 'แจ้งเตือน', detail: 'ระบุจำนวนที่ต้องการแก้ไข !!', life: 3000 });
      return;
    }

    const editData = {
      id: Id,
      product_id: this.productId,
      product_remain: this.productRemain,
      productEdit: this.productEdit,
      stock_id: this.stockId,
      idcard: this.idcard
    }

    this.rest.updateProductRemain(editData).pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'แก้ไขจำนวนสินค้าเรียบร้อยแล้ว' });
          this.loadProductImport();
          this.productEdit = null;
        } else {
          this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'ไม่สามารถแก้ไขจำนวนสินค้าได้' });
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'มีข้อผิดพลาดในการเชื่อมต่อ' });
        console.error('Error updating status:', error);
      }
    });
  }

  deleteProduct(id: number, product_id: string, product_remain: string, stock_id: string) {
    this.alert.cancel('แจ้งเตือน', 'ต้องการลบข้อมูลใช่หรือไม่ ?').then(
      (result) => {
        if (result.isConfirmed) {
          const productData = {
            id,
            product_id,
            product_remain,
            stock_id,
            idcard: this.idcard
          }

          this.rest.deleteProductB(productData).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
              if (res.success) {
                this.alert.success('สำเร็จ', res.message);
                this.loadProductImport();
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

  exportStock() {
    if (this.activeItem.id === 'tab1') {
      this.generatePDF(this.stockAData, 'A');
    } else if (this.activeItem.id === 'tab2') {
      this.generatePDF(this.stockBData, 'B');
    }
  }

  generatePDF(data: any, type: string) {
    const fileName = `Stock${type}_Report_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;

    this.rest.generateStockPDF(data, type).subscribe({
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
      error: (error: any) => {
        console.error('Error generating PDF:', error);
      }
    });
  }

  showCancelDialog(data: any) {
    this.visible = true;
    this.productId = data.product_id;
    this.productDetail = data.product_detail;
    this.productRemain = data.product_remain;
    this.stockId = data.stock_id;
    this.Id = data.id;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}