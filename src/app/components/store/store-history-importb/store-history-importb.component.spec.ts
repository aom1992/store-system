import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreHistoryImportbComponent } from './store-history-importb.component';

describe('StoreHistoryImportbComponent', () => {
  let component: StoreHistoryImportbComponent;
  let fixture: ComponentFixture<StoreHistoryImportbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreHistoryImportbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreHistoryImportbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
