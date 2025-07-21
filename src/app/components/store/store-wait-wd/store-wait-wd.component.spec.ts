import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreWaitWdComponent } from './store-wait-wd.component';

describe('StoreWaitWdComponent', () => {
  let component: StoreWaitWdComponent;
  let fixture: ComponentFixture<StoreWaitWdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreWaitWdComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreWaitWdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
