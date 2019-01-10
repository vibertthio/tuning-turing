import React, { Component } from 'react';
import Tone from 'tone';
import { render } from 'react-dom';
import TWEEN from '@tweenjs/tween.js';

import styles from './index.module.scss';
import sig from './assets/sig.png';
import info from './assets/info.png';
import Sound from './music/sound';
import Renderer from './renderer/renderer';
import { rms } from './utils/utils';
import urls from './utils/m2c_game_audio_path.json';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false, // menu
      slash: true,
      playing: false,
      mouseDown: false,
      dragging: false,
      loadingSongs: true,
      loadingProgress: 0,
      rhythmThreshold: 0.6,
      finishedAnswer: false,
      answerCorrect: false,
      waitingNext: false,
      restart: false,
      bpm: 120,
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      score: 0,
      level: 0,
    };

    this.nOfQuestion = 3;

    this.TWEEN = TWEEN;
    this.ans = 0;
    this.canvas = [];
    this.waveforms = [[], []];
    this.bpms = [];
  }

  initSound() {
    this.sound = new Sound(this);
    this.resetPlayers();
  }

  resetPlayers(reset = false) {
    let { level } = this.state;

    if (!reset) {
      console.log(`[level]: ${level}`);
      console.log('retrieving files...');
    } else {
      level = 0;
      console.log(`[level]: ${level}`);
      console.log('retrieving files...');
    }

    const onload = () => {
      const { loadingProgress } = this.state;
      let loadingSongs = true;

      if (loadingProgress > 0) {
        console.log('finish retrieving.');
        loadingSongs = false;
        this.setWaveforms();
      }

      this.setState({
        loadingProgress: loadingProgress + 1,
        loadingSongs,
      });
    };

    this.setState({
      loadingProgress: 0,
    });

    this.ans = (Math.random() > 0.5) ? 1 : 0;
    this.sound.players[this.ans] = new Tone.Player(urls['MTRNNPath'][level], onload).toMaster();
    this.sound.players[1 - this.ans] = new Tone.Player(urls['HumanCompose'][level], onload).toMaster();
  }

  componentDidMount() {
    this.initSound();
    this.renderer = new Renderer(this, this.canvas);
    this.addEventListeners();
    requestAnimationFrame(() => { this.update() });
  }

  addEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
    window.addEventListener('resize', this.handleResize.bind(this, false));
    window.addEventListener('click', this.handleClick.bind(this));
    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  removeEventListener() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    window.removeEventListener('click', this.handleClick.bind(this));
    window.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    window.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    window.removeEventListener('resize', this.handleResize.bind(this, false));
  }

  componentWillUnmount() {
    removeEventListener();
  }

  setWaveforms() {
    for (let x = 0; x < 2; x += 1) {
      const n = 64;
      const bufferData = this.sound.players[x].buffer.getChannelData();
      const bufferLength = bufferData.length;
      const blockLength = bufferLength / n;
      this.waveforms[x] = [];

      for (let i = 0; i < (n - 1); i += 1) {
        const arr = bufferData.slice(i * blockLength, (i + 1) * blockLength);
        const amp = Math.pow(rms(arr), 1.2);
        this.waveforms[x].push(amp);
      }
    }
  }

  resetAns() {}

  update() {
    this.TWEEN.update();

    // const { progress } = this.sound.part;
    this.renderer.draw(this.state.screen);
    requestAnimationFrame(() => { this.update() });
  }

  handleResize(value, e) {
    this.setState({
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleClick(e) {
    e.stopPropagation();
    const { slash } = this.state;

    if (!slash) {
      this.setState({
        dragging: false,
      });
    }
  }

  handleMouseDown(e) {
    e.stopPropagation();
    const { slash, waitingNext, playing } = this.state;

    if (!slash) {
      const id = this.renderer.handleMouseDown(e);
      if(id === 0) {
        this.sound.start(0);
      } else if (id === 1) {
        this.sound.start(1);
      }

      if (id !== -1) {
        this.setState({
          finishedAnswer: true,
        });
      }
    }

    this.setState({
      playing: true,
    });
  }

  handleMouseUp(e) {
    e.stopPropagation();
    const { slash, waitingNext } = this.state;
    if (!slash && !waitingNext) {
      this.renderer.handleMouseUp(e);
    }
  }

  handleMouseMove(e) {
    e.stopPropagation();
    const { slash } = this.state;
    if (!slash) {
      this.renderer.handleMouseMove(e);
      if (this.state.mouseDown) {
        this.setState({
          dragging: true,
        });
      }
    }
  }

  handleClickMenu() {
    const { open } = this.state;
    if (open) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  handleKeyDown(event) {
    event.stopPropagation();
    const { loadingSongs } = this.state;
    if (!loadingSongs) {
      if (event.keyCode === 32) {
        // space
        this.trigger();
      }
      if (event.keyCode === 65) {
        // a
      }
      if (event.keyCode === 82) {
        // r
      }
    }
  }

  openMenu() {
    document.getElementById('menu').style.height = '100%';
    this.setState({
      open: true,
    });
  }

  closeMenu() {
    document.getElementById('menu').style.height = '0%';
    this.setState({
      open: false,
    });
  }

  trigger() {
    const playing = this.sound.trigger();
    this.renderer.playing = playing;
    this.setState({
      playing,
    });
  }

  start() {
    this.sound.start();
    this.renderer.playing = true;
    this.setState({
      playing: true,
    });
  }

  stop() {
    this.sound.stop();
    this.renderer.playing = false;
    this.setState({
      playing: false,
    });
  }

  onPlay() {
    console.log('press play!');
    const { restart } = this.state;

    const id = restart ? 'splash-score' : 'splash';
    const splash = document.getElementById(id);
    splash.style.opacity = 0.0;
    setTimeout(() => {
      splash.style.display = 'none';
      this.setState({
        score: 0,
        slash: false,
      });
    }, 500);
  }

  checkFinished() {
    return (this.renderer.selected !== -1);
  }

  checkCorrect() {
    return (this.renderer.selected === this.ans);
  }

  onClickTheButton(e) {
    e.stopPropagation();
    if (this.state.waitingNext) {
      this.sound.stop();
      const result = document.getElementById('resultText');
      result.style.display = 'none';

      if (this.state.level >= this.nOfQuestion) {
        // reset game
        this.sound.triggerSoundEffect(3);

        const splash = document.getElementById('splash-score');
        splash.style.display = 'block';
        splash.style.opacity = 1.0;


        this.resetPlayers(true);
        this.setState({
          level: 0,
          restart: true,
          waitingNext: false,
          finishedAnswer: false,
          slash: true,
        });
        return;
      }

      this.renderer.selected = -1;
      this.resetPlayers();

      this.setState({
        loadingSongs: true,
        waitingNext: false,
        finishedAnswer: false,
      });
      return;
    }

    if (this.state.finishedAnswer) {

      const { level } = this.state;
      console.log('send the answer');
      this.sound.stop();

      const tips = document.getElementById('tips');
      tips.style.display = 'none';

      const result = document.getElementById('resultText');
      result.style.display = 'block';

      const correct = this.checkCorrect();
      const score = this.state.score + (correct ? 1 : 0);

      if (correct) {
        this.sound.triggerSoundEffect(2);
      } else {
        this.sound.triggerSoundEffect(1);
      }

      this.setState({
        level: level + 1,
        waitingNext: true,
        answerCorrect: correct,
        score,
      });

      return;
    }
  }

  render() {
    const { level, waitingNext, loadingSongs, finishedAnswer, answerCorrect, score } = this.state;
    const loadingText = loadingSongs ? 'loading...' : 'play';
    let buttonText = finishedAnswer ? 'send' : 'choosing...';

    if (loadingSongs) {
      buttonText = 'loading ...';
    } else if (waitingNext) {
      if (level < this.nOfQuestion) {
        buttonText = 'next';
      } else {
        buttonText = 'end';
      }
    }


    const resultText = answerCorrect ? 'correct!' : 'wrong!';
    const resultColor = answerCorrect ? '#6affb0' : '#E00005';
    const scoreText = `${score.toString()}/${(this.nOfQuestion).toString()}`;
    const bottomScoreText = `[ score: ${score.toString()}/${(this.nOfQuestion).toString()} ]`;


    const arr = Array.from(Array(9).keys());
    const mat = Array.from(Array(9 * 16).keys());
    const { rhythmThreshold, bpm } = this.state;
    return (
      <div>
        <section className={styles.splash} id="splash">
          <div className={styles.wrapper}>
            <h1>Quiz</h1>
            <h2>
              = 👩‍🎨 Turing Test + 🤖 Harmanization
            </h2>
            <div className="device-supported">
              <p className={styles.description}>
                A game based on a musical machine learning algorithm which can harmanize the given melodies. <br/>
                The player has to choose the one generated by the algorithm.
              </p>

              <button
                className={styles.playButton}
                id="splash-play-button"
                onClick={() => this.onPlay()}
              >
                {loadingText}
              </button>

              <p className={styles.builtWith}>
                Built with tone.js + js canvas.
                <br />
                Learn more about <a className={styles.about} target="_blank" href="https://github.com/vibertthio">how it works.</a>
              </p>

              <p>Made by</p>
              <img className="splash-icon" src={sig} width="100" height="auto" alt="Vibert Thio Icon" />
            </div>
          </div>
          <div className={styles.badgeWrapper}>
            <a className={styles.magentaLink} href="http://musicai.citi.sinica.edu.tw/" target="_blank" >
              <div>Music and AI Lab</div>
            </a>
          </div>
          <div className={styles.privacy}>
            <a href="https://github.com/vibertthio" target="_blank">Privacy &amp; </a>
            <a href="https://github.com/vibertthio" target="_blank">Terms</a>
          </div>
        </section>
        <section className={styles.splash} id="splash-score" style={{display: "none"}}>
          <div className={styles.wrapper}>
            <h3>Score</h3>
            <h1>{scoreText}</h1>
            <div className="device-supported">

              <button
                className={styles.playButton}
                id="splash-play-button"
                onClick={() => this.onPlay()}
              >
                play again
              </button>

              <p className={styles.builtWith}>
                Built with tone.js + musicvae.js.
                <br />
                Learn more about <a className={styles.about} target="_blank" href="https://github.com/vibertthio">how it works.</a>
              </p>

              <p>Made by</p>
              <img className="splash-icon" src={sig} width="100" height="auto" alt="Vibert Thio Icon" />
            </div>
          </div>
          <div className={styles.badgeWrapper}>
            <a className={styles.magentaLink} href="http://musicai.citi.sinica.edu.tw/" target="_blank" >
              <div>Music and AI Lab</div>
            </a>
          </div>
          <div className={styles.privacy}>
            <a href="https://github.com/vibertthio/sornting" target="_blank">Privacy &amp; </a>
            <a href="https://github.com/vibertthio/sornting" target="_blank">Terms</a>
          </div>
        </section>

        <div className={styles.title}>
          <div className={styles.link}>
            <a href="https://github.com/vibertthio/sornting" target="_blank" rel="noreferrer noopener">
              Quiz
            </a>
          </div>
          <button
            className={styles.btn}
            onClick={() => this.handleClickMenu()}
            onKeyDown={e => e.preventDefault()}
          >
            <img alt="info" src={info} />
          </button>

          <div className={styles.tips} id="tips">
            <h3>🙋‍♀️Tips</h3>
            <p>⚡Which one is made by 🤖? Click to listen.<br />
              👇Press the SEND button to check the answer</p>
          </div>
          <h1 className={styles.result} id="resultText"><font color={resultColor}>{resultText}</font></h1>

        </div>
        <div>
          <canvas
            ref={ c => this.canvas = c }
            className={styles.canvas}
            width={this.state.screen.width * this.state.screen.ratio}
            height={this.state.screen.height * this.state.screen.ratio}
          />
        </div>
        <div className={styles.control}>
          <div className={styles.slider}>
            <button
              className={styles.sendButton}
              onClick={e => this.onClickTheButton(e)}
              onKeyDown={e => e.preventDefault()}
            >
              {buttonText}
            </button>
          </div>
          <div className={styles.score}>
            <p>{bottomScoreText}</p>
          </div>
        </div>
        <div id="menu" className={styles.overlay}>
          <button className={styles.overlayBtn} onClick={() => this.handleClickMenu()} />
          <div className={styles.intro}>
            <p>
              <strong>$ 🎸Sornting $</strong>
              <br />= Sort + Song
              <br />A game based on a musical machine learning algorithm which can interpolate different melodies. Made by{' '}
              <a href="https://vibertthio.com/portfolio/" target="_blank" rel="noreferrer noopener">
                Vibert Thio
              </a>.{' Source code is on '}
              <a
                href="https://github.com/vibertthio"
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub.
              </a>
            </p>
            <p>
              <strong>$ How to use $</strong> <br />
              ⚡Drag the <font color="#2ecc71">melodies below</font> <br />
              into the <font color="#f39c12">golden box</font> above <br />
              to complete the interpolation.
            </p>
          </div>
          <button className={styles.overlayBtn} onClick={() => this.handleClickMenu()} />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
