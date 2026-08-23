import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailUsersComponent } from './detail-users.component';

describe('DetailUsersComponent', () => {
  let component: DetailUsersComponent;
  let fixture: ComponentFixture<DetailUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
