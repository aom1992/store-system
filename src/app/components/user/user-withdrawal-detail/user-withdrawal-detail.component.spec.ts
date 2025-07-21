import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWithdrawalDetailComponent } from './user-withdrawal-detail.component';

describe('UserWithdrawalDetailComponent', () => {
  let component: UserWithdrawalDetailComponent;
  let fixture: ComponentFixture<UserWithdrawalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWithdrawalDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserWithdrawalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
