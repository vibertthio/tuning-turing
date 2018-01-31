import { Transport, Player } from 'tone';
import { drumUrls, bassUrls, keysUrls, saxUrls } from './sound';

export default class SamplesManager {
  currentKey: Number;
  samples: Array;
  table: Array;
  currentTableIndex: Number;
  currentSamplesIndex: Array;
  loadingSamples: Boolean;
  loadingStatus: Number;
  loadingSamplesCallback: Function;

  constructor(callback) {
    this.currentKey = null;
    this.samples = [];
    this.loadingStatus = 0;
    this.loadingSamplesCallback = callback;
    this.urls = [drumUrls, bassUrls, keysUrls, saxUrls];

    this.loadSamples();
    this.initTable();

    Transport.bpm.value = 90;
    Transport.loopStart = 0;
    Transport.loopEnd = '4m';
    Transport.loop = true;

    Transport.schedule(() => {
      const currentTable = this.table[this.currentTableIndex];
      for (let i = 0; i < 4; i += 1) {
        this.samples[i][currentTable[i]].start();
      }
    }, '0');
    Transport.scheduleRepeat(() => {
      console.log(Transport.position);
    }, '1m');
  }

  initTable() {
    this.currentTableIndex = 0;
    this.table = [];
    for (let i = 0; i < 12; i += 1) {
      this.table[i] = [];
      for (let j = 0; j < 4; j += 1) {
        this.table[i][j] = Math.floor(Math.random() * 4);
      }
    }
  }

  loadSamples() {
    console.log('start loading samples..');
    this.currentSamplesIndex = [0, 0, 0, 0];

    for (let i = 0; i < 4; i += 1) {
      this.samples[i] = [];
      for (let j = 0; j < 4; j += 1) {
        this.samples[i][j] = new Player(this.urls[i][j], () => {
          this.loadingStatus += 1;
          this.loadingSamplesCallback(this.loadingStatus);
        }).toMaster();
        this.samples[i][j].loop = true;
      }
    }
  }

  triggerRandomSamples() {
    for (let i = 0; i < 4; i += 1) {
      this.samples[i][this.currentSamplesIndex[i]].stop('@4m');
      const rand = Math.floor(Math.random() * 4);
      this.currentSamplesIndex[i] = rand;
    }
    console.log(this.currentSamplesIndex);
  }

  triggerTableSamples(i) {
    this.currentTableIndex = i;
  }

  trigger() {
    if (Transport.state === 'started') {
      Transport.stop();
      for (let i = 0; i < 4; i += 1) {
        this.samples[i][this.currentSamplesIndex[i]].stop();
      }
      return false;
    }

    console.log(this.currentSamplesIndex);
    Transport.start();
    return true;
  }
}
