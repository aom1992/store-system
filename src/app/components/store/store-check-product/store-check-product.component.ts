import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs';
import { Table } from 'primeng/table';
import { RestService } from 'src/app/service/rest.service';
import { ColorService } from 'src/app/service/color.service';

@Component({
  selector: 'app-store-check-product',
  templateUrl: './store-check-product.component.html',
  styleUrl: './store-check-product.component.scss'
})
export class StoreCheckProductComponent implements OnInit {
  currentMenu: string | null = null;
  product_id: string | null = null;

  productData: any[] = [];
  
 constructor(
  private route: ActivatedRoute,
  private rest: RestService,
  private color: ColorService,
 ){}

 ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.currentMenu = params['currentMenu'];
  });

  this.route.paramMap.subscribe(params => {
    this.product_id = params.get('product_id');
  });
  console.log('product_id >>', this.product_id);

  this.loadProductDetail();
 }

 loadProductDetail(){
  this.rest.getCheckProduct(this.product_id).pipe(timeout(60000)).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.productData = res.data;
      }else {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
      }
    },
    error: (error) => {
      console.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: ', error.message);
    },
  })
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
