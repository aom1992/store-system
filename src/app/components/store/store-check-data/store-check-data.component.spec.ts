import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCheckDataComponent } from './store-check-data.component';

describe('StoreCheckDataComponent', () => {
  let component: StoreCheckDataComponent;
  let fixture: ComponentFixture<StoreCheckDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCheckDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreCheckDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
