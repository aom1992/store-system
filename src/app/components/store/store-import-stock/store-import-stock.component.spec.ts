import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreImportStockComponent } from './store-import-stock.component';

describe('StoreImportStockComponent', () => {
  let component: StoreImportStockComponent;
  let fixture: ComponentFixture<StoreImportStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreImportStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreImportStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
