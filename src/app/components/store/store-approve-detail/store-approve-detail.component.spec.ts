import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreApproveDetailComponent } from './store-approve-detail.component';

describe('StoreApproveDetailComponent', () => {
  let component: StoreApproveDetailComponent;
  let fixture: ComponentFixture<StoreApproveDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreApproveDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreApproveDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
