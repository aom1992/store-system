import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/service/rest.service';
import { timeout } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { AlertService } from 'src/app/service/alert.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-store-import-stock',
  templateUrl: './store-import-stock.component.html',
  styleUrls: ['./store-import-stock.component.scss']
})
export class StoreImportStockComponent implements OnInit {
  menuLabel: string | null = null;
  date: Date = new Date();
  selectedFile: File | null = null;
  idcard: string;
  remark: string;

  stockData: any[] = [];
  selectedStock: string = 'A';

  @ViewChild('fileUpload') fileUpload: FileUpload;

  constructor(
    private route: ActivatedRoute,
    private rest: RestService,
    private auth: AuthService,
    private alert: AlertService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.menuLabel = params['menuLabel'] || 'Default Label';
    });

    const loginData = this.auth.getDataLogin();
    this.idcard = loginData.idcard;

    this.loadStock();
  }

  loadStock() {
    this.rest.getStockType().pipe(timeout(60000)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.stockData = res.data;
        } else {
          console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', res.message);
        }
      },
      error: (error: any) => {
        console.error('เกิดข้อผิดพลาด:', error);
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.files[0];
  }

  uploadFile() {
    const formData = new FormData();
    formData.append("file", this.selectedFile);
    formData.append("selectedStock", this.selectedStock);
    formData.append("idcard", this.idcard);

    if (this.remark && this.remark.trim() !== "") {
      formData.append("remark", this.remark);
    }

    this.http.post(`${environment.apiUrl}api/excel/upload`, formData)
      .subscribe({
        next: () => {
          this.alert.success("สำเร็จ", "อัปโหลดสำเร็จ");
          this.clearData();
        },
        error: (err) => {
          this.alert.message("ผิดพลาด", "อัปโหลดล้มเหลว");
          console.error("อัปโหลดล้มเหลว", err);
        }
      });
  }

  clearData() {
    this.selectedFile = null;
    this.remark = "";

    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }
}