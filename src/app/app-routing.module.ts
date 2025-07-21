import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './services/auth.guard';
import { UserRequestComponent } from './components/user/user-request/user-request.component';
import { UserRequestHistoryComponent } from './components/user/user-request-history/user-request-history.component';
import { UserWithdrawalDetailComponent } from './components/user/user-withdrawal-detail/user-withdrawal-detail.component';
import { BossApproveComponent } from './components/boss/boss-approve/boss-approve.component';
import { BossApproveHistoryComponent } from './components/boss/boss-approve-history/boss-approve-history.component';
import { StoreApproveDetailComponent } from './components/store/store-approve-detail/store-approve-detail.component';
import { StoreCheckDataComponent } from './components/store/store-check-data/store-check-data.component';
import { StoreApproveComponent } from './components/store/store-approve/store-approve.component';
import { StoreWithdrawalHistoryComponent } from './components/store/store-withdrawal-history/store-withdrawal-history.component';
import { StoreApproveProductComponent } from './components/store/store-approve-product/store-approve-product.component';
import { StoreWaitMnComponent } from './components/store/store-wait-mn/store-wait-mn.component';
import { StoreWaitWdComponent } from './components/store/store-wait-wd/store-wait-wd.component';
import { StoreEditWithdrawalComponent } from './components/store/store-edit-withdrawal/store-edit-withdrawal.component';
import { StoreEditDetailComponent } from './components/store/store-edit-detail/store-edit-detail.component';
import { StoreImportStockComponent } from './components/store/store-import-stock/store-import-stock.component';
import { StoreImportStockbComponent } from './components/store/store-import-stockb/store-import-stockb.component';
import { StoreHistoryImportaComponent } from './components/store/store-history-importa/store-history-importa.component';
import { StoreHistoryImportbComponent } from './components/store/store-history-importb/store-history-importb.component';
import { StoreCheckStockComponent } from './components/store/store-check-stock/store-check-stock.component';
import { StoreCompareStockComponent } from './components/store/store-compare-stock/store-compare-stock.component';
import { StoreProductDetailaComponent } from './components/store/store-product-detaila/store-product-detaila.component';
import { StoreProductDetailbComponent } from './components/store/store-product-detailb/store-product-detailb.component';
import { StoreCheckProductComponent } from './components/store/store-check-product/store-check-product.component';
import { AdminSettingComponent } from './components/admin-setting/admin-setting.component';


@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: '', redirectTo: 'login', pathMatch: 'full' },
            {
                path: '', component: AppLayoutComponent, canActivate: [authGuard],
                children: [
                    { path: 'user-request', component: UserRequestComponent },
                    { path: 'user-request-history', component: UserRequestHistoryComponent },
                    { path: 'user-withdrawal-detail/:pw_id', component: UserWithdrawalDetailComponent },
                    { path: 'boss-approve', component: BossApproveComponent },
                    { path: 'boss-approve-history', component: BossApproveHistoryComponent },
                    { path: 'store-approve-detail', component: StoreApproveDetailComponent },
                    { path: 'store-check-data', component: StoreCheckDataComponent },
                    { path: 'store-approve', component: StoreApproveComponent },
                    { path: 'store-withdrawal-history', component: StoreWithdrawalHistoryComponent },
                    { path: 'store-approve-product/:pw_id', component: StoreApproveProductComponent },
                    { path: 'store-wait-mn', component: StoreWaitMnComponent },
                    { path: 'store-wait-wd', component: StoreWaitWdComponent },
                    { path: 'store-edit-withdrawal', component: StoreEditWithdrawalComponent },
                    { path: 'store-edit-detail/:pw_id', component: StoreEditDetailComponent },
                    { path: 'store-import-stock', component: StoreImportStockComponent },
                    { path: 'store-import-stockb', component: StoreImportStockbComponent },
                    { path: 'store-history-importa', component: StoreHistoryImportaComponent },
                    { path: 'store-history-importb', component: StoreHistoryImportbComponent },
                    { path: 'store-check-stock', component: StoreCheckStockComponent },
                    { path: 'store-compare-stock', component: StoreCompareStockComponent },
                    { path: 'store-product-detaila/:date_input', component: StoreProductDetailaComponent },
                    { path: 'store-product-detailb/:date_input', component: StoreProductDetailbComponent },
                    { path: 'store-check-product/:product_id', component: StoreCheckProductComponent },
                    { path: 'admin-setting', component: AdminSettingComponent }
                ]
            },
            { path: 'login', component: LoginComponent },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})

export class AppRoutingModule { }