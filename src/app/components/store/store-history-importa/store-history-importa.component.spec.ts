import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreHistoryImportaComponent } from './store-history-importa.component';

describe('StoreHistoryImportaComponent', () => {
  let component: StoreHistoryImportaComponent;
  let fixture: ComponentFixture<StoreHistoryImportaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreHistoryImportaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StoreHistoryImportaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
