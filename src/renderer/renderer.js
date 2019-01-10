import WaveDisplay from './wave-display';
import { Noise } from 'noisejs';
import { lerpColor } from './../utils/utils';
import { relative } from 'path';

export default class Renderer {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = canvas;
    this.melodies = [];
    this.melodiesIndex = 0;
    this.waves = [];
    this.nOfAns = 2;
    this.fontSize = 1.0;
    this.playing = false;
    this.frameCount = 0;
    this.halt = false;

    // this.backgroundColor = 'rgba(37, 38, 35, 1.0)';
    this.backgroundColor = 'rgba(15, 15, 15, 1.0)';
    this.noteOnColor = 'rgba(255, 255, 255, 1.0)';
    this.mouseOnColor = 'rgba(150, 150, 150, 1.0)';
    this.noteOnCurrentColor = 'rgba(255, 100, 100, 1.0)';
    this.boxColor = 'rgba(200, 200, 200, 1.0)';

    // length
    this.displayWidth = 0;
    this.h = 0;
    this.widthMidRatio = 0.5;
    this.heightMidRatio = 0.45;

    // waves
    this.waveDisplay = []
    this.waveDisplay[0] = new WaveDisplay(this, 0, 0, -1.3);
    this.waveDisplay[1] = new WaveDisplay(this, 1, 0, 1.3);

    // new
    this.selected = -1;
    this.hover = -1;

    // interpolation display
    this.h_step = 0;

    // instruction
    this.endOfSection = false;
    this.instructionState = 0;

  }

  updateMelodies(ms) {}

  draw(src, progress = 0) {

    this.frameCount += 1;
    this.progress = progress;

    const ctx = this.canvas.getContext('2d');
    // ctx.font = this.fontSize.toString() + 'rem monospace';
    this.width = src.width;
    this.height = src.height;
    const width = src.width;
    const height = src.height;

    ctx.save();
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // const h = Math.min(width, height) * 0.18;
    // const h = width * 0.1;
    const w = Math.min(((width - 150) / (this.nOfAns * 1.5)), 250);
    // const w = h;
    const h = w * 0.8;
    this.h = h;
    this.displayWidth = w;
    this.setFontSize(ctx, Math.pow(w / 800, 0.3));

    ctx.translate(width * this.widthMidRatio, height * this.heightMidRatio);

    this.waveDisplay[0].draw(ctx, w, h);
    this.waveDisplay[1].draw(ctx, w, h);

    ctx.restore();
  }

  handleInterpolationClick(x, y) {
    const xpos = x + (this.displayWidth * 0.5);
    const ypos = y;
    return false;
  }

  handleMouseClick(e) {
    let cx = e.clientX - this.width * 0.5;;
    let cy = e.clientY - this.height * 0.5;
    const onAns = -1;
    const onOptions = -1;
    return [
      onAns,
      onOptions,
    ];
  }

  handleMouseDown(e) {
    const { waitingNext } = this.app.state;
    let x = e.clientX - this.width * this.widthMidRatio;
    let y = e.clientY - this.height * this.heightMidRatio;
    let ret = -1;

    if (Math.abs(y) < this.h * 0.5) {
      if (x > 0) {
        ret = 1;
      } else {
        ret = 0;
      }
      if (!waitingNext) {
        // console.log('change selected');
        this.selected = ret;
      }
    }

    return ret;
  }

  handleMouseMove(e) {
    const x = e.clientX - (this.width * this.widthMidRatio);
    const y = e.clientY - (this.height * this.heightMidRatio);

    if (Math.abs(y) < this.h * 0.8) {
      if (x > 0) {
        this.hover = 1;
      } else {
        this.hover = 0;
      }
    } else {
      this.hover = -1;
    }
  }

  handleMouseUp(e) {}

  // instruction
  changeInstructionState(s) {
    this.instructionState = s;
  }

  // draw frame
  drawFrame(ctx, w, h) {
    const unit = this.h * 0.1;

    ctx.save();

    ctx.strokeStyle = '#FFF';

    ctx.beginPath()
    ctx.moveTo(0.5 * w, 0.5 * h - unit);
    ctx.lineTo(0.5 * w, 0.5 * h);
    ctx.lineTo(0.5 * w - unit, 0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-0.5 * w, 0.5 * h - unit);
    ctx.lineTo(-0.5 * w, 0.5 * h);
    ctx.lineTo(-0.5 * w + unit, 0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(0.5 * w, -0.5 * h + unit);
    ctx.lineTo(0.5 * w, -0.5 * h);
    ctx.lineTo(0.5 * w - unit, -0.5 * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-0.5 * w, -0.5 * h + unit);
    ctx.lineTo(-0.5 * w, -0.5 * h);
    ctx.lineTo(-0.5 * w + unit, -0.5 * h);
    ctx.stroke();

    ctx.restore();
  }

  setFontSize(ctx, amt) {
    this.fontSize = amt;
    ctx.font = this.fontSize.toString() + 'rem monospace';
  }


}
