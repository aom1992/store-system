import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-store-check-data',
  templateUrl: './store-check-data.component.html',
  styleUrls: ['./store-check-data.component.scss']
})
export class StoreCheckDataComponent implements OnInit {
  menuLabel: string = 'ตรวจสอบข้อมูลสินค้า';
  items1: MenuItem[] = [];
  items2: MenuItem[] = [];
  items3: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.items1 = [
      {
        label: 'รับเข้า/เติมสินค้า (IMPORT DATA STOCK A)',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-import-stock'], { queryParams: { menuLabel: this.menuLabel } });
        }        
      },
      {
        label: 'ประวัติการรับเข้า (STOCK A)',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-history-importa'], { queryParams: { menuLabel: this.menuLabel} });
        }
      }
    ];

    this.items2 = [
      {
        label: 'ตรวจสอบข้อมูลสินค้า (A/B)',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-check-stock'], { queryParams: { menuLabel: this.menuLabel} });
        }
      },
      {
        label: 'เทียบข้อมูล MAC5',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-compare-stock'], { queryParams: { menuLabel: this.menuLabel} });
        }
      }
    ];

    this.items3 = [
      {
        label: 'รับเข้า/เติมสินค้า (IMPORT DATA STOCK B)',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-import-stockb'], { queryParams: { menuLabel: this.menuLabel} });
        }
      },
      {
        label: 'ประวัติการรับเข้า (STOCK B)',
        icon: 'pi pi-angle-right',
        command: () => {
          this.router.navigate(['/store-history-importb'], { queryParams: { menuLabel: this.menuLabel} });
        }
      }
    ];
  }

  navigate(item: MenuItem, event: Event): void {
    if (item.command) {
      item.command({ originalEvent: event, item: item });
    }
  }
}
