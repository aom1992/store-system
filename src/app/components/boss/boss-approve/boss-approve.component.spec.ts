import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BossApproveComponent } from './boss-approve.component';

describe('BossApproveComponent', () => {
  let component: BossApproveComponent;
  let fixture: ComponentFixture<BossApproveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BossApproveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BossApproveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
