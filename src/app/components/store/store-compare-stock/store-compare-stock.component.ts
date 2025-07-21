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
  selector: 'app-store-compare-stock',
  templateUrl: './store-compare-stock.component.html',
  styleUrl: './store-compare-stock.component.scss'
})
export class StoreCompareStockComponent implements OnInit {
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

  }

  onFileSelected(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('กรุณาเลือกไฟล์ก่อน!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.apiUrl}api/excel/upload-excel`, formData)
      .subscribe({
        next: (res: any) => {
          this.stockData = res.data;
        },
        error: (err) => {
          this.alert.message("ผิดพลาด", "อัปโหลดล้มเหลว");
          console.error("อัปโหลดล้มเหลว", err);
        }
      }
    );    
  }
}
