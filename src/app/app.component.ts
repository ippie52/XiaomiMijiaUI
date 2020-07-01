import { Component } from '@angular/core';
import { WebSocketConnState} from './services/wss.service';
import { WsApiService, ScriptSettings, XiaomiSensor } from './services/ws-api.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'xiaomi-sensor-ui';

  public connState$: Observable<WebSocketConnState>;

  public settings$: Observable<ScriptSettings>;

  public sensors$: Observable<Map<string, XiaomiSensor>>;

  public myData = [
    ['Water', {v: 78, f: '78%'}]
  ];
  public options = {
    width: 500,
    height: 500,
    greenFrom: 50,
    greenTo: 100,
    redFrom: 0,
    redTo: 20,
    yellowFrom: 20,
    yellowTo: 50,
    minorTicks: 5,
    majorTicks: ['0%', '50%', '100%']
  };

  constructor(private wss: WsApiService) {
    this.connState$ = this.wss.getStateSourceObservable();
    this.settings$ = this.wss.scriptSettingsSource.asObservable();
    this.sensors$ = this.wss.sensorsSource.asObservable();
  }

  stopConnecting() {
    this.wss.stopConnecting();
  }

  startConnecting() {
    this.wss.startConnecting();
  }
}
