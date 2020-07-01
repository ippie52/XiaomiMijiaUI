import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorLiveComponent } from './sensor-live.component';

describe('SensorLiveComponent', () => {
  let component: SensorLiveComponent;
  let fixture: ComponentFixture<SensorLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
