import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BossApproveHistoryComponent } from './boss-approve-history.component';

describe('BossApproveHistoryComponent', () => {
  let component: BossApproveHistoryComponent;
  let fixture: ComponentFixture<BossApproveHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BossApproveHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BossApproveHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
