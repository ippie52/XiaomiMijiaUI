import { Component, OnInit, Input } from '@angular/core';
import { XiaomiSensor, XiaomiSensorReading } from '../../services/ws-api.service';

@Component({
  selector: 'app-sensor-live',
  templateUrl: './sensor-live.component.html',
  styleUrls: ['./sensor-live.component.scss']
})
export class SensorLiveComponent implements OnInit {

  @Input('sensor')
  set sensor(value: XiaomiSensor) {
    this.sensorData = value;
    this.temperatureGaugeData = [
      ['Temp (°C)', {
        v: this.sensorData.last_reading.temperature,
        f: this.sensorData.last_reading.temperature + '°C'
      }]
    ];
    this.humidityGaugeData = [
      ['Humid (%)', {
        v: this.sensorData.last_reading.humidity,
        f: this.sensorData.last_reading.humidity + '%'
      }]
    ];
    this.lastReading = this.sensorData.last_reading.timestamp;
    this.sensorName = this.sensorData.sensor_name;
    this.sensorAddr = this.sensorData.addr;
  }

  private sensorData: XiaomiSensor = undefined;

  public temperatureGaugeData = undefined;

  public temperatureGaugeOptions = {
    width: 300,
    height: 300,
    greenFrom: 31,
    greenTo: 33,
    redFrom: 33,
    redTo: 40,
    yellowFrom: 21,
    yellowTo: 31,
    minorTicks: 1,
    majorTicks: ['21', '40'],
    min: 21,
    max: 40
  };

  public humidityGaugeData = undefined;

  public humidityGaugeOptions = {
    width: 300,
    height: 300,
    greenFrom: 90,
    greenTo: 100,
    redFrom: 0,
    redTo: 70,
    yellowFrom: 70,
    yellowTo: 90,
    minorTicks: 4,
    majorTicks: ['0%', '25%', '50%', '75%', '100%'],
  };

  public lastReading: Date = undefined;

  public sensorName: string = undefined;

  public sensorAddr: string = undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
