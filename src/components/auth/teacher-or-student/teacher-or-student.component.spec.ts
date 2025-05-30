import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherOrStudentComponent } from './teacher-or-student.component';

describe('TeacherOrStudentComponent', () => {
  let component: TeacherOrStudentComponent;
  let fixture: ComponentFixture<TeacherOrStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherOrStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherOrStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
