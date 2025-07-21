import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RippleModule } from 'primeng/ripple';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { DialogModule } from 'primeng/dialog';
import { FieldsetModule } from 'primeng/fieldset';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ChartModule } from 'primeng/chart';
import { BadgeModule } from 'primeng/badge';
import { KeyFilterModule } from 'primeng/keyfilter';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TabMenuModule } from 'primeng/tabmenu';
import { ImageModule } from 'primeng/image';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SelectButtonModule } from 'primeng/selectbutton';

import { LoginComponent } from './components/login/login.component';
import { AuthRedirectComponent } from './components/auth-redirect/auth-redirect.component';
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
    declarations: [
        AppComponent,
        LoginComponent,
        AuthRedirectComponent,
        UserRequestComponent,
        UserRequestHistoryComponent,
        UserWithdrawalDetailComponent,
        BossApproveComponent,
        BossApproveHistoryComponent,
        StoreApproveDetailComponent,
        StoreCheckDataComponent,
        StoreApproveComponent,
        StoreWithdrawalHistoryComponent,
        StoreApproveProductComponent,
        StoreWaitMnComponent,
        StoreWaitWdComponent,
        StoreEditWithdrawalComponent,
        StoreEditDetailComponent,
        StoreImportStockComponent,
        StoreImportStockbComponent,
        StoreHistoryImportaComponent,
        StoreHistoryImportbComponent,
        StoreCheckStockComponent,
        StoreCompareStockComponent,
        StoreProductDetailaComponent,
        StoreProductDetailbComponent,
        StoreCheckProductComponent,
        AdminSettingComponent
    ],
    imports: [
        AppRoutingModule, 
        AppLayoutModule,
        BrowserAnimationsModule,
        HttpClientModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        TableModule,
        ToggleButtonModule,
        RippleModule,
        MultiSelectModule,
        DropdownModule,
        ProgressBarModule,
        ToastModule,
        SliderModule,
        RatingModule,
        DialogModule,
        FieldsetModule,
        CalendarModule,
        FileUploadModule,
        InputTextareaModule,
        CardModule,
        ConfirmDialogModule,
        RadioButtonModule,
        CommonModule,
        ChartModule,
        BadgeModule,
        KeyFilterModule,
        FloatLabelModule,
        TabMenuModule,
        ImageModule,
        TooltipModule,
        InputNumberModule,
        TabViewModule,
        PanelMenuModule,
        TableModule,
        SelectButtonModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
