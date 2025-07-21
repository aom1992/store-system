import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreProductDetailbComponent } from './store-product-detailb.component';

describe('StoreProductDetailbComponent', () => {
  let component: StoreProductDetailbComponent;
  let fixture: ComponentFixture<StoreProductDetailbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreProductDetailbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreProductDetailbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
