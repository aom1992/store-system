import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreApproveProductComponent } from './store-approve-product.component';

describe('StoreApproveProductComponent', () => {
  let component: StoreApproveProductComponent;
  let fixture: ComponentFixture<StoreApproveProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreApproveProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreApproveProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
