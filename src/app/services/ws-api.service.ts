import { Injectable, OnDestroy } from '@angular/core';
import { WssService, WebSocketConnState } from './wss.service';
import { Observable, Subject, BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/// @brief  The Websocket server message interface.
export interface WssMessage {
  cmd: string;
  data: any;
}

/// @brief  The available Websocket server commands.
export enum WssCommands {
  Settings = 'settings',
  Sensors = 'sensors',
  SingleSensor = 'single_sensor',
  RequestHistory = 'history'
}

export interface SensorIntervalTime {
  mins: number;
  secs: number;
}

export interface ScriptSettings {
  interval: SensorIntervalTime;
  sensor_file: string;
  save_id: number;
  scan_seconds: number;
  max_attempts: number;
  next_scan: Date;
}

export interface XiaomiSensorReading {
  battery: number;
  humidity: number;
  temperature: number;
  timestamp: Date;
}

export interface XiaomiSensor {
  active: boolean;
  addr: string;
  dev_name: string;
  history_file: string;
  last_reading: XiaomiSensorReading;
  sensor_name: string;
}
export interface XiaomiSensorHistoryData {
  sensor_name: string;
  sensor_addr: string;
  history: Map<Date, XiaomiSensorReading>;
}

/// The server address/hostname
// const HOSTNAME = '192.168.1.133'; // BLE-PI
const HOSTNAME = '192.168.1.6'; // incubator
/// The server port
const SERVER_PORT = 9042;

@Injectable({
  providedIn: 'root'
})
export class WsApiService implements OnDestroy {

  // Subscription to the websocket service state
  private wsStateSub: Subscription;

  /// @brief  Source subject for script settings.
  public scriptSettingsSource = new BehaviorSubject<ScriptSettings>(undefined);

  /// @brief  Source subject for available devices.
  public sensorsSource = new BehaviorSubject<Map<string, XiaomiSensor>>(undefined);

  /// @brief  Source subject for all history data.
  public historySource = new BehaviorSubject<XiaomiSensorHistoryData>({
    sensor_name: undefined,
    sensor_addr: undefined,
    history: undefined
  });

  /// @brief  The messages subject, for pushing new messages to the WebSocket server.
  private messages: Subject<WssMessage>;

  /// @brief  Constructor for the websocket server API.
  constructor(private ws: WssService) {
    this.wsStateSub = this.ws.connectionStateSource.asObservable()
      .subscribe((state: WebSocketConnState) => {
        console.log('Connection state updated: ' + state);
        if (state === WebSocketConnState.Disconnected) {
          this.bindToWebSocket(true);
        }
      });
    this.bindToWebSocket();
  }

  /// @brief  Disconnects the state subscription.
  ngOnDestroy() {
    this.wsStateSub.unsubscribe();
  }

  // ---------------------------------------------------------------------------
  /// @brief  Binds the Messages to the WebSocket.
  /// @param  reconnect - Indicates whether a reconnection is permitted.
  bindToWebSocket(reconnect = false) {
    // Connect to the incoming message events
    // const url = 'ws://' + window.location.hostname + ':' + SERVER_PORT;
    const url = 'ws://' + HOSTNAME + ':' + SERVER_PORT;
    this.messages = this.ws.connect(url, reconnect).pipe(
      map((response: MessageEvent): WssMessage => {
        const data = JSON.parse(response.data);
        return { cmd: data.cmd, data: data.data };
      })
    ) as Subject<WssMessage>;
    // Handle incoming messages
    this.messages.subscribe(msg => {
      console.log('Received message: ' + JSON.stringify(msg));
      switch (msg.cmd) {

        // case WssCommands.SettingsUpdate:
        //   console.log('incoming settings info');
        //   console.log(msg.data);
        //   this.handleSettingsUpdate(msg.data);
        //   break;
        // case WssCommands.Plugin:
        //   this.handlePluginMessage(msg.data);
        //   console.log('Message received from plug-in: ' + msg.data);
          // break;
        case WssCommands.RequestHistory:
          const sensorHistoryData: XiaomiSensorHistoryData = msg.data;
          const sensorData = this.historySource.getValue();
          sensorData[sensorHistoryData.sensor_addr] = sensorHistoryData;
          this.historySource.next(sensorData);
          console.log('History provided for sensor:' + sensorHistoryData.sensor_name);
          break;
        case WssCommands.Sensors:
          console.log('Sensors provided: ');
          this.sensorsSource.next(msg.data);
          console.log(msg.data);
          break;
        case WssCommands.Settings:
          console.error('NEED TO HANDLE SETTINGS MESSAGES!');
          this.scriptSettingsSource.next(msg.data);
          console.log(msg.data);
          break;
        default:
          console.error('Unknown command received: ' + msg.cmd);
          break;
      }
    });
  }

  /// @brief  Gets the connection state as an observable.
  getStateSourceObservable() {
    return this.ws.connectionStateSource.asObservable();
  }

  /// @brief  Send updated settings.
  updateSettings(settings: ScriptSettings) {
    const msg: WssMessage = {
      cmd: WssCommands.Settings,
      data: settings
    };
    this.messages.next(msg);
  }

  /// @brief  Sends the websocket server updated sensor information for
  ///         all known sensors.
  updateSensors(sensors: Map<string, XiaomiSensor>) {
    const msg: WssMessage = {
      cmd: WssCommands.Sensors,
      data: sensors
    };
    this.messages.next(msg);
  }

  /// @brief  Sends the websocket server updated sensor information for
  ///         one sensor.
  updateSingleSensor(id: string, xSensor: XiaomiSensor) {
    const msg: WssMessage = {
      cmd: WssCommands.SingleSensor,
      data: {
        index: id,
        sensor: xSensor
      }
    };
    this.messages.next(msg);
  }

  requestHistory(id: string) {
    const msg: WssMessage = {
      cmd: WssCommands.RequestHistory,
      data: id
    };
    this.messages.next(msg);
  }

  stopConnecting() {
    this.ws.stopConnecting();
  }

  startConnecting() {
    this.ws.startConnecting();
  }
}
