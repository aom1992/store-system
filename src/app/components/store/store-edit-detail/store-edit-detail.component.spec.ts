import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreEditDetailComponent } from './store-edit-detail.component';

describe('StoreEditDetailComponent', () => {
  let component: StoreEditDetailComponent;
  let fixture: ComponentFixture<StoreEditDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreEditDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreEditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
