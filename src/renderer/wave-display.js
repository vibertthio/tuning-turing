import { lerp, roundedRect } from '../utils/utils';

export default class WaveDisplay {

  constructor(renderer, id = 0, ysr = 0, xsr = 0) {
    this.id = id;
    this.matrix = [];
    this.noteList = [];
    this.renderer = renderer;
    this.frameRatio = 1.1;

    this.gridWidth = 0;
    this.gridHeight = 0;
    this.gridXShift = 0;
    this.gridYShift = 0;
    this.dragX = 0;
    this.dragY = 0;
    this.noteOnColor = 'rgba(255, 255, 255, 1.0)';
    this.blueColor = '#3742fa';
    this.purpleColor = '#D5B6FF';
    this.greenColor = '#45BEA4';
    this.redColor = '#E00005';
    this.orangeColor = '#FF7B57';
    this.tronGreenColor = '#6affb0';

    this.yShiftRatio = ysr;
    this.xShiftRatio = xsr;

    // animation
    this.currentNoteIndex = -1;
    this.currentNoteYShift = 0;
    this.currentChordIndex = -1;
    this.currentChordYShift = 0;
    this.newSectionYShift = 1;

    // instruction
    this.showingInstruction = false;
  }

  update(w, h) {
    this.gridWidth = w;
    this.gridHeight = h;
    this.gridYShift = h * this.yShiftRatio * 0.7;
    this.gridXShift = w * this.xShiftRatio * 0.7;
  }

  draw(ctx, w, h, frameOnly = false) {
    this.update(w, h)
    this.updateYShift();

    ctx.save();
    ctx.translate(this.gridXShift, this.gridYShift);
    this.drawFrame(ctx, this.gridWidth * this.frameRatio, this.gridHeight * this.frameRatio);
    this.drawBling(ctx, this.gridWidth * this.frameRatio - 15, this.gridHeight * this.frameRatio - 12);

    ctx.save();
    ctx.translate(-w * 0.5, 0);

    // roll
    const { waitingNext } = this.renderer.app.state;

    const nOfBlocks = 64;

    const wStep = w / nOfBlocks;
    const player = this.renderer.app.sound.players[this.id];
    const p = this.renderer.app.sound.playersPositions[this.id]
    const hRatio = 4000;

    const waveforms = this.renderer.app.waveforms[this.id];
    ctx.fillStyle = '#FFF';

    waveforms.forEach((value, i) => {
      ctx.save();
      ctx.translate(i * wStep, 0);
      const length = value * hRatio;
      ctx.translate(0, -0.5 * length);

      if (p > (i / nOfBlocks) && p < ((i + 1) / nOfBlocks)) {
        if (this.checkSelected()) {
          ctx.fillStyle = this.tronGreenColor;
        } else {
          ctx.fillStyle = this.blueColor;
        }
      } else {
        ctx.fillStyle = '#FFF';
      }


      if (waitingNext) {
        if (this.checkSelected()) {
          ctx.fillStyle = this.tronGreenColor;
        } else {
          ctx.fillStyle = this.redColor;
        }
      }

      ctx.fillRect(0, 0, wStep * 0.8, length);
      ctx.restore();
    });


    // progress
    ctx.translate(0, -h * 0.5);
    if (p > 0) {
      ctx.save();
      // ctx.translate((b % (nOfBars * nOfBeats)) * wStep, 0);
      ctx.translate(w * p, 0);
      ctx.fillStyle = this.blueColor;
      ctx.strokeStyle = this.blueColor;
      if (this.checkSelected()) {
        ctx.fillStyle = this.tronGreenColor;
        ctx.strokeStyle = this.tronGreenColor;
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, h * 0.02, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, h, h * 0.02, 0, Math.PI * 2);
      ctx.fill();


      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }

  isPlaying() {
    // return this.renderer.playing;
    return true;
  }

  checkSelected() {
    return (this.id === this.renderer.selected);
  }

  checkAnswer() {
    return (this.id === this.renderer.app.ans);
  }

  checkCurrent() {
    return true;
  }

  updateYShift() {
    this.currentNoteYShift *= 0.9;
    this.currentChordYShift *= 0.9;
    this.newSectionYShift *= 0.9;
  }

  triggerStartAnimation() {
    this.newSectionYShift = 1;
  }

  drawFrame(ctx, w, h) {
    const ratio = this.dynamic ? 0.08 : 0.06;
    const unit = this.renderer.h * ratio;
    let size = 0.5;

    if (this.checkSelected()) {
      size = 0.5 + 0.03 * Math.pow(Math.sin(this.renderer.frameCount * 0.05), 2);
    }

    if (this.id === 0 && this.renderer.hover === 0) {
      size = 0.55;
    }
    if (this.id === 1 && this.renderer.hover === 1) {
      size = 0.55;
    }



    ctx.save();

    ctx.strokeStyle = '#FFF';
    if (this.checkSelected()) {
      ctx.strokeStyle = this.tronGreenColor;
      // ctx.strokeStyle = this.purpleColor;
      // ctx.strokeStyle = '#2ecc71';
      // ctx.strokeStyle = this.blueColor;
    }

    const { waitingNext, answerCorrect } = this.renderer.app.state;
    if (waitingNext) {
      if (this.checkAnswer()) {
        ctx.strokeStyle = this.tronGreenColor;
      } else {
        ctx.strokeStyle = this.redColor;
      }
    }

    ctx.beginPath()
    ctx.moveTo(size * w, size * h - unit);
    ctx.lineTo(size * w, size * h);
    ctx.lineTo(size * w - unit, size * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-size * w, size * h - unit);
    ctx.lineTo(-size * w, size * h);
    ctx.lineTo(-size * w + unit, size * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(size * w, -size * h + unit);
    ctx.lineTo(size * w, -size * h);
    ctx.lineTo(size * w - unit, -size * h);
    ctx.stroke();

    ctx.beginPath()
    ctx.moveTo(-size * w, -size * h + unit);
    ctx.lineTo(-size * w, -size * h);
    ctx.lineTo(-size * w + unit, -size * h);
    ctx.stroke();

    ctx.restore();
  }

  drawBling(ctx, w, h) {
    if (this.showingInstruction) {
      ctx.save();
      ctx.translate(-0.5 * w, -0.5 * h);
      ctx.fillStyle = '#555';
      // ctx.fillStyle = lerpColor(
      //   '#555555',
      //   '#AA0000',
      //   Math.pow(
      //     Math.sin(this.renderer.frameCount * 0.03),
      //     2,
      //   ),
      // );
      roundedRect(ctx, 0, 0, w, h, 5);
      ctx.restore();
    }
  }

  drawInstructionText(ctx, w, h) {

  }



}
