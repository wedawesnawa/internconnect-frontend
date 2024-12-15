import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DosenComponent } from './dosen.component';

describe('DosenComponent', () => {
  let component: DosenComponent;
  let fixture: ComponentFixture<DosenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DosenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
