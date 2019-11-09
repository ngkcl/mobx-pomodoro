import React from 'react';
import './App.css';

import {autorun, observable, action, computed} from 'mobx';

import moment, { Moment } from 'moment';

import { Line, Circle } from 'rc-progress';

import format from 'format-number-with-string';
import { TimerDisplay } from './TimerDisplay';
import { observer } from 'mobx-react-lite';

let alarm: HTMLAudioElement | null;

class TimerStore {
  @observable isRunning: boolean;
  @observable timer: Timer;
  @observable startTime: number | Moment | undefined;

  constructor() {
    this.isRunning = false;
    this.timer = new Timer();
  }

  @computed get mainDisplay(): string {
    return this.timer.display;
  }

  @computed get hasStarted(): boolean {
    return this.timer.totalMiliseconds !== 0;
  }

  @computed get percentageElapsed(): number {
    return (this.timer.elapsed/POMODORO_INITIAL_TIME) * 100;
  }

  @action measure() {
    if (!this.isRunning) return;

    this.timer.time = this.timer.time - 10;

    if (this.timer.time <= 0) {
      this.timer.time = 0;

      if (alarm) {
        alarm.play();
        return;
      }
    }

    setTimeout(() => this.measure(), 10);
  }

  @action startTimer() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = moment();
    this.measure();
  }

  @action resetTimer() {
    this.timer.reset();
    this.isRunning = false;
  }
}

const POMODORO_INITIAL_TIME: number = 1000*60*25;

class Timer {
  @observable time: number | 0;
  @observable elapsed: number | 0;
  
  constructor(initialTime = POMODORO_INITIAL_TIME) {
    this.time = initialTime;
    this.elapsed = 0;
    autorun(() => {
      this.elapsed = initialTime - this.time;
    });
  }

  @action reset(): void {
    this.time = POMODORO_INITIAL_TIME;
    this.elapsed = 0;
  }

  @computed get totalMiliseconds(): number {
    return this.time;
  }

  @computed get totalElapsed(): number {
    return this.elapsed;
  }

  @computed get display(): string {
    const tenMili = this.totalMiliseconds / 10;
    
    const seconds: number = tenMili / 100;
    const minutes: number = Math.floor(seconds/60);

    return `${minutes} : ${format(seconds % 60, '00')} :  ${format(tenMili % 100, '00')}`;  
  }
}

const timerStore: TimerStore = new TimerStore();

const App  = observer(() => {
  let firstButton: any;
  let secondButton: any;

  if (!timerStore.isRunning) {
    secondButton = (
      <button
        style={{color: '#4bd761'}}
        onClick={() => timerStore.startTimer()}
      >
        start
      </button>
    )

    firstButton = (
      <button
        style={undefined}
        onClick={() => timerStore.resetTimer()}
      >
        reset
      </button>
    )

    if (!timerStore.hasStarted) {
      firstButton = null;
    }
  } else {
    secondButton = (
      <button
        style={{color: '#fd3d2a'}}
        onClick={() => timerStore.resetTimer()}
      >
        reset
      </button>
    );

    firstButton = null;
  }



  return (
    <div className="App">
      <header className="App-header">
        <p>
          Pomodoro
        </p>

        <div className="progress-bar">
          <Circle percent={timerStore.percentageElapsed} strokeWidth={4} strokeColor="#D3D3D3" />
        </div>
        <p>{timerStore.mainDisplay}</p>

        <div>
          {firstButton}
          {secondButton}
        </div>
      </header>
      <audio ref={alarmRef => alarm = alarmRef}>
        <source src={require('./alarm.mp3')} type="audio/mpeg">
        </source>
      </audio>
    </div>
  );
})

export default App;