import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { RestService } from '../service/rest.service';
import { timeout } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    totalRepairCount: number = 0;
    totalQuoteCount: number = 0;
    idcard: any;
    depart_id: any;
    pp_id: any;

    constructor(
        public layoutService: LayoutService,
        public router: Router,
        public auth: AuthService,
        public rest: RestService
    ) { }

    ngOnInit(): void {
        const login = this.auth.getDataLogin();
        this.idcard = login.idcard;
        this.depart_id = login.id_depart;
        this.pp_id = login.pp_id;

        this.loadTopbarCount();
    }

    loadTopbarCount() {
        const format = {
            idcard: this.idcard,
            depart_id: this.depart_id,
            pp_id: this.pp_id
        };
        this.rest.getCountTopbar(format).pipe(timeout(60000)).subscribe({
            next: (res: any) => {
                if (res.status) {
                    this.totalRepairCount = res.totalRepair || 0;
                    this.totalQuoteCount = res.totalQuote || 0;

                    console.log('totalRepairCount : ', this.totalRepairCount);
                    console.log('totalQuoteCount : ', this.totalQuoteCount);
                }
            },
            error: (err) => {
                console.error('โหลดข้อมูล countRepair ไม่ได้:', err);
            }
        });
    }

    redirectToRepairSystem(): void {
        const token = this.auth.getToken();
        const redirectUrl = `${environment.redirectMnUrl}&token=${encodeURIComponent(token)}`;
        window.open(redirectUrl, '_blank');
    }      

    redirectToQuotationSystem(): void {
        const token = this.auth.getToken();
        const redirectUrl = `${environment.redirectUrl}?token=${encodeURIComponent(token)}&type=topbar`;
        window.open(redirectUrl, '_blank');
    }

    logOut(): void {
        this.auth.logOut();
        console.log('Logout Successful');
        this.router.navigate(['/']);
    }
}
