import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreWithdrawalHistoryComponent } from './store-withdrawal-history.component';

describe('StoreWithdrawalHistoryComponent', () => {
  let component: StoreWithdrawalHistoryComponent;
  let fixture: ComponentFixture<StoreWithdrawalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreWithdrawalHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreWithdrawalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
