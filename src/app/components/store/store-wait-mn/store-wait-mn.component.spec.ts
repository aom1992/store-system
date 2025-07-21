import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreWaitMnComponent } from './store-wait-mn.component';

describe('StoreWaitMnComponent', () => {
  let component: StoreWaitMnComponent;
  let fixture: ComponentFixture<StoreWaitMnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreWaitMnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreWaitMnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
