import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCompareStockComponent } from './store-compare-stock.component';

describe('StoreCompareStockComponent', () => {
  let component: StoreCompareStockComponent;
  let fixture: ComponentFixture<StoreCompareStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCompareStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreCompareStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
