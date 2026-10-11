import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataAccessHttp } from './data-access-http';

describe('DataAccessHttp', () => {
  let component: DataAccessHttp;
  let fixture: ComponentFixture<DataAccessHttp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataAccessHttp],
    }).compileComponents();

    fixture = TestBed.createComponent(DataAccessHttp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
