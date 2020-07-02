import { Component, OnInit, Input } from '@angular/core';
import { WsApiService, XiaomiSensor, XiaomiSensorReading, XiaomiSensorHistoryData } from '../../services/ws-api.service';
import { Observable } from 'rxjs';

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
    this.sensorTempF = ((this.sensorData.last_reading.temperature * 9.0) / 5.0) + 32.0;
  }

  public sensorData: XiaomiSensor = undefined;

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

  public sensorTempF: number;

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

  public historyData$: Observable<XiaomiSensorHistoryData>;

  constructor(private wss: WsApiService) {
    this.historyData$ = wss.historySource.asObservable();
  }

  ngOnInit(): void {
  }

  getHistory() {
    this.wss.requestHistory(this.sensorAddr);
  }

  historyGraphData(data: XiaomiSensorHistoryData) {
    const hData = [
      ['Time stamp', 'Temperature °C', 'Humidity %'],
    ];
    // if (data !== undefined && data.history !== undefined) {
    //   console.log(data);
    //   data.history.forEach((value: XiaomiSensorReading, key: Date) => {
    //     const entry = [key.toTimeString(), value.temperature.toString(), value.humidity.toString()];
    //     hData.push(entry);
    //   });
    //   console.log('---------------------');
    //   console.log(hData);
    //   console.log('---------------------');
    // }
    return hData;
  }

}
