import { Injectable, OnDestroy } from '@angular/core';
import { Observer, Observable, Subject, BehaviorSubject } from 'rxjs';

/// @brief  The connection state of the WebSocket.
export enum WebSocketConnState {
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Disconnecting = 'Disconnecting'
}

@Injectable({
  providedIn: 'root'
})
export class WssService implements OnDestroy {

  /// @brief  The source of the connection state subject.
  public connectionStateSource =
    new BehaviorSubject<WebSocketConnState>(WebSocketConnState.Disconnected);

  /// @brief  The message event subject.
  private subject: Subject<MessageEvent>;

  /// @brief  The WebSocket connection.
  private ws: WebSocket = undefined;

  /// @brief  The URL of the WebSocket server.
  private url: string;

  /// @brief  The connection state check interval ID.
  private stateCheckIntID: any = undefined;

  // ---------------------------------------------------------------------------
  /// @brief  Empty constructor.
  constructor() {
    this.startConnecting();
  }

  startConnecting() {
    if (this.stateCheckIntID === undefined) {
      this.stateCheckIntID = setInterval(() => this.connectionCheck(), 2000);
    }
  }

  stopConnecting() {
    if (this.stateCheckIntID !== undefined) {
      clearInterval(this.stateCheckIntID);
    }
    this.stateCheckIntID = undefined;
  }

  // ---------------------------------------------------------------------------
  /// @brief  OnDestrory method - clears the interval method.
  ngOnDestroy() {
    this.stopConnecting();
  }

  // ---------------------------------------------------------------------------
  /// @brief  Connects to the given URL.
  /// @param  url The websocket URL to connect to.
  /// @param  reconnect Allows reconnection
  /// @return The message event subject.
  public connect(url: string, reconnect = false): Subject<MessageEvent> {
    if (!this.subject || reconnect) {
      try {
        this.url = url;
        this.subject = this.create(url, reconnect);
        this.updateConnState(WebSocketConnState.Connecting);
      } catch (e) {
        console.log('Failed to create the subject: ' + e);
      }
    }
    return this.subject;
  }

  // ---------------------------------------------------------------------------
  /// @brief  Creates a new WebSocket connection.
  /// @param  url The websocket URL to connect to.
  /// @return Message event subject.
  private create(url: string, recreate: boolean): Subject<MessageEvent> {
    console.log("========== CALLING CREATE ===========");
    if (!this.ws || recreate) {
      if (this.ws) {
        this.ws.close();
      }
      try {
        this.ws = new WebSocket(url);
        setTimeout(() => {
          if (this.ws === undefined || this.ws.readyState !== 1) {
            console.error('WS: Connection to ' + url + ' failed.');
            this.connectionStateSource.next(WebSocketConnState.Disconnected);
          }
        }, 3000);
        const observable = Observable.create((obs: Observer<MessageEvent>) => {
          this.ws.onopen = ((event) => {
            console.log('Connected to ' + url);
            this.connectionStateSource.next(WebSocketConnState.Connected);
          });
          this.ws.onmessage = obs.next.bind(obs);
          this.ws.onerror = obs.error.bind(obs);
          this.ws.onclose = obs.complete.bind(obs);
          return this.ws.close.bind(this.ws);
        });
        const observer = {
          next: (data: object) => {
            if (this.ws.readyState === WebSocket.OPEN) {
              const msg = JSON.stringify(data);
              console.log('WS: Sending a message: ' + msg);
              // Confirm that we're connected
              this.ws.send(msg);
            }
          },
          error: (reason: object) => {
            console.error('WS: Error - ' + reason);
          },
          complete: (data: object) => {
            console.log('WebSocket closed. ' + data);
            this.connectionStateSource.next(WebSocketConnState.Disconnected);
          }
        };
        return Subject.create(observer, observable);
      } catch (e) {
        console.error('Failed to connect:' + e);
        throw e;
      }
    } else {
      console.error('WS: Could not create');
    }
  }

  // ---------------------------------------------------------------------------
  /// @brief  Updates the state if it is different to the current state.
  private updateConnState(newState: WebSocketConnState) {
    if (newState !== this.connectionStateSource.value) {
      this.connectionStateSource.next(newState);
    }
  }

  // ---------------------------------------------------------------------------
  /// @brief  Function used to check the connection state to the WebSocket
  ///         server, updating the connection state when necessary.
  private connectionCheck(): void {
    if (this.ws !== undefined) {
      switch (this.ws.readyState) {
          case WebSocket.CLOSING:
            this.updateConnState(WebSocketConnState.Disconnecting);
            break;
          case WebSocket.CONNECTING:
            this.updateConnState(WebSocketConnState.Connecting);
            break;
          case WebSocket.OPEN:
            this.updateConnState(WebSocketConnState.Connected);
            break;
          case WebSocket.CLOSED:
          default:                // Deliberate fall-through
            console.error('WebSocket disconnected.');
            this.updateConnState(WebSocketConnState.Disconnected);
            break;
      }
    } else {
      console.error('Failed to check connection');
    }
  }
}
