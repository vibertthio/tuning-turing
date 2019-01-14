import Tone, { Transport } from 'tone';
import StartAudioContext from 'startaudiocontext';

import beepSound from './effect/beep.wav';
import wrongSound from './effect/wrong.wav';
import correctSound from './effect/correct.wav';
import endSound from './effect/end.wav';
import transitionSound from './effect/transition.wav';

export default class Sound {
  constructor(app, onload) {
    StartAudioContext(Tone.context);
    this.playing = false;
    this.currentId = -1;
    this.app = app;

    this.effects = [];
    this.effects[0] = new Tone.Player(beepSound).toMaster();
    this.effects[1] = new Tone.Player(wrongSound).toMaster();
    this.effects[2] = new Tone.Player(correctSound).toMaster();
    this.effects[3] = new Tone.Player(endSound).toMaster();
    this.effects[4] = new Tone.Player(transitionSound).toMaster();
    this.setVolumes();

    this.players = [];
    this.playersPositions = { '0': 0, '1': 0 };
    this.tweens = [];

    // Transport.bpm.value = 150;
    // Transport.start();
  }

  setVolumes() {
    this.effects[0].volume.value = -13;
    this.effects[1].volume.value = -13;
    this.effects[2].volume.value = -13;
    this.effects[3].volume.value = -13;
    this.effects[4].volume.value = -13;
  }

  changeBpm(b) {
    Transport.bpm.value = b;
  }

  stop() {
    this.playing = false;
    this.tweens.forEach(t => t.stop());
    this.players.forEach(p => p.stop());
    this.playersPositions = { '0': 0, '1': 0 };
  }

  pause() {
    this.playing = false;
    this.tweens.forEach(t => t.stop());
    this.players.forEach(p => p.stop());
  }

  resume(pos) {
    const id = this.currentId;

    if (pos) {
      this.playersPositions[id] = pos;
    }

    this.playing = true;
    const TWEEN = this.app.TWEEN;
    const time = ((this.players[id].buffer.length / 44100) * 1000) * (this.playersPositions[id]);
    const timeLeft = ((this.players[id].buffer.length / 44100) * 1000) * (1 - this.playersPositions[id]);

    this.players[id].start(undefined, time / 1000);
    const dest = id === 0 ? { '0': 1 } : { '1': 1 };
    this.tweens[id] = new TWEEN.Tween(this.playersPositions)
      .to(dest, timeLeft)
      .onComplete(() => {
        this.playing = false;
        this.playersPositions[id] = 0;
      })
      .start();
  }

  start(id = 0) {
    this.currentId = id;
    this.playing = true;
    const TWEEN = this.app.TWEEN;
    const time = (this.players[id].buffer.length / 44100) * 1000;
    const theOtherId = (id === 0) ? 1 : 0;

    this.players[id].start();
    this.players[theOtherId].stop();
    this.playersPositions = { '0': 0, '1': 0 };

    const dest = id === 0 ? { '0': 1 } : { '1': 1 };
    this.tweens[id] = new TWEEN.Tween(this.playersPositions)
      .to(dest, time)
      .onComplete(() => {
        this.playing = false;
        this.playersPositions[id] = 0;
      })
      .start();
  }

  trigger() {
    if (this.playing) {
      stop();
      return false;
    } else {
      resume(this.currentId);
      return true;
    }
  }

  triggerSoundEffect(index = 0) {
    if (index > -1 && index < this.effects.length) {
      this.effects[index].start();
    }
  }
}
