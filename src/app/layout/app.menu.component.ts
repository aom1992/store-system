import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';
import { AuthService } from '../service/auth.service';
import { RestService } from '../service/rest.service';
import { timeout } from 'rxjs';
import { SocketService } from '../service/socket.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];
    countStoreAprData: string = '0';
    bossCountData: string = '0';

    name: string = '';
    idcard: string = '';

    constructor(
        public layoutService: LayoutService,
        public auth: AuthService,
        public rest: RestService,
        public socketService: SocketService,
    ) { }

    ngOnInit() {
        const {
            name, idcard
        } = this.auth.getDataLogin();

        this.name = name;
        this.idcard = idcard;
        this.createMenu();

        this.socketService.newSumStore().subscribe((newCount: number) => {
            console.log('Store ได้รับการอัปเดตจำนวน:', newCount);
            this.countStoreAprData = newCount > 0 ? newCount.toString() : '';
            this.createMenu();
        });

        this.socketService.newSumBoss().subscribe((newCount: number) => {
            console.log('หัวหน้าแผนกได้รับการอัปเดตจำนวน:', newCount);
            this.bossCountData = newCount > 0 ? newCount.toString() : '';
            this.createMenu();
        });
    }

    createMenu() {
        this.rest.getMenuByIdCard(this.idcard).pipe(timeout(60000)).subscribe({
            next: (data) => {
                this.model = data.map((menu: any) => ({
                    label: menu.label,
                    items: menu.items.map((sub: any) => ({
                        label: sub.sub_topic,
                        routerLink: sub.url,
                        icon: 'pi pi-fw pi-chevron-circle-right',
                        badge: sub.badge ? String(sub.badge) : undefined // แสดงเฉพาะเมื่อมี badge
                    }))
                }));

                this.model.unshift({
                    label: 'Profile',
                    items: [
                        { label: this.name, icon: 'pi pi-fw fa-regular fa-circle-user' }
                    ]
                });
            }
        });
    }
}