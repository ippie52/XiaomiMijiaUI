import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { GoogleChartsModule } from 'angular-google-charts';
import { SensorLiveComponent } from './widgets/sensor-live/sensor-live.component';

@NgModule({
  declarations: [
    AppComponent,
    SensorLiveComponent
  ],
  imports: [
    BrowserModule,
    GoogleChartsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
