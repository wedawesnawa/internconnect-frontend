import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonevComponent } from './monev.component';

describe('MonevComponent', () => {
  let component: MonevComponent;
  let fixture: ComponentFixture<MonevComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonevComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonevComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
