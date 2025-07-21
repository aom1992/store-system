import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreImportStockbComponent } from './store-import-stockb.component';

describe('StoreImportStockbComponent', () => {
  let component: StoreImportStockbComponent;
  let fixture: ComponentFixture<StoreImportStockbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreImportStockbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreImportStockbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
