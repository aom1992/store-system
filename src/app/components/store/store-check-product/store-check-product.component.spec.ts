import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCheckProductComponent } from './store-check-product.component';

describe('StoreCheckProductComponent', () => {
  let component: StoreCheckProductComponent;
  let fixture: ComponentFixture<StoreCheckProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCheckProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreCheckProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
