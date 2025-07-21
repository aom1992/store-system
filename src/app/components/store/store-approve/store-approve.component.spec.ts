import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreApproveComponent } from './store-approve.component';

describe('StoreApproveComponent', () => {
  let component: StoreApproveComponent;
  let fixture: ComponentFixture<StoreApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreApproveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
