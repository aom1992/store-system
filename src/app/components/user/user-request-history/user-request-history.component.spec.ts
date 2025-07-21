import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRequestHistoryComponent } from './user-request-history.component';

describe('UserRequestHistoryComponent', () => {
  let component: UserRequestHistoryComponent;
  let fixture: ComponentFixture<UserRequestHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRequestHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserRequestHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
