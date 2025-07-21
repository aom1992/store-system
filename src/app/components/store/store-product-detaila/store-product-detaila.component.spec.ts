import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreProductDetailaComponent } from './store-product-detaila.component';

describe('StoreProductDetailaComponent', () => {
  let component: StoreProductDetailaComponent;
  let fixture: ComponentFixture<StoreProductDetailaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreProductDetailaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreProductDetailaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
