import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreEditWithdrawalComponent } from './store-edit-withdrawal.component';

describe('StoreEditWithdrawalComponent', () => {
  let component: StoreEditWithdrawalComponent;
  let fixture: ComponentFixture<StoreEditWithdrawalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreEditWithdrawalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreEditWithdrawalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
