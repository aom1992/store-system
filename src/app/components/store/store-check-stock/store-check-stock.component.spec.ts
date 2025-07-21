import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCheckStockComponent } from './store-check-stock.component';

describe('StoreCheckStockComponent', () => {
  let component: StoreCheckStockComponent;
  let fixture: ComponentFixture<StoreCheckStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCheckStockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreCheckStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
