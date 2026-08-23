import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMonevComponent } from './detail-monev.component';

describe('DetailMonevComponent', () => {
  let component: DetailMonevComponent;
  let fixture: ComponentFixture<DetailMonevComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailMonevComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailMonevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
