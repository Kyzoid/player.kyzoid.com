window.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById("audio");
  const currentTimeDOM = document.getElementById('current-time');
  const barElapsedDOM = document.getElementById('bar-elapsed');
  const button = document.querySelector('.audio-player > .time-elapsed > .button');

  button.addEventListener('click', (event) => {
    const isPlaying = event.target.dataset.playing;
    event.target.src = isPlaying === 'false' ? 'images/pause.svg' : 'images/play.svg';
    event.target.dataset.playing = isPlaying === 'false' ? 'true' : 'false';

    if (isPlaying === 'false') {
      audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('timeupdate', () => {
    const s = parseInt(audio.currentTime % 60);
    const m = parseInt((audio.currentTime / 60) % 60);

    if (currentTimeDOM) {
      currentTimeDOM.textContent = s < 10 ? `${m}:0${s}` : `${m}:${s}`;
    }

    if (barElapsedDOM) {
      const widthElapsed = (audio.currentTime / audio.duration) * 100;
      barElapsedDOM.style.width = `${widthElapsed}%`;
    }
  });

  const context = new AudioContext();
  const src = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();

  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  src.connect(analyser);
  analyser.connect(context.destination);

  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  let barHeight;
  let x = 0;

  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;
  let barWidth = (WIDTH / bufferLength) * 2.5;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    barWidth = (WIDTH / bufferLength) * 2.5;
  });

  const renderFrame = () => {
    requestAnimationFrame(renderFrame);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];

      const r = 20 + barHeight;
      const g = 255 - barHeight;
      const b = 255;

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ", 0.8)";
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  renderFrame();
});