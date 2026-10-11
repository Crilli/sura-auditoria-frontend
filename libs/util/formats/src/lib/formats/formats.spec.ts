import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Formats } from './formats';

describe('Formats', () => {
  let component: Formats;
  let fixture: ComponentFixture<Formats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Formats],
    }).compileComponents();

    fixture = TestBed.createComponent(Formats);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
