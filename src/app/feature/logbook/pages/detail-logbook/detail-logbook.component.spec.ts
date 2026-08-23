import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailLogbookComponent } from './detail-logbook.component';

describe('DetailLogbookComponent', () => {
  let component: DetailLogbookComponent;
  let fixture: ComponentFixture<DetailLogbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailLogbookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailLogbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
