window.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById("audio");
  const currentTimeDOM = document.getElementById('current-time');
  const barElapsedDOM = document.getElementById('bar-elapsed');
  const button = document.querySelector('.audio-player > .time-elapsed > .button');
  let audioInitialized = false;

  let context, src, analyser, bufferLength, dataArray;
  let barWidth = 0;

  button.addEventListener('click', (event) => {
    const isPlaying = event.target.dataset.playing;
    event.target.src = isPlaying === 'false' ? 'images/pause.svg' : 'images/play.svg';
    event.target.dataset.playing = isPlaying === 'false' ? 'true' : 'false';

    if (isPlaying === 'false') {
      audio.play();

      if (!audioInitialized) {
        audioInitialized = true;
        context = new AudioContext();
        src = context.createMediaElementSource(audio);
        analyser = context.createAnalyser();

        src.connect(analyser);
        analyser.connect(context.destination);
      
        analyser.fftSize = 256;
      
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        barWidth = (WIDTH / bufferLength) * 2.5;
      }
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

  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  let barHeight;
  let x = 0;

  let WIDTH = canvas.width;
  let HEIGHT = canvas.height;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    barWidth = (WIDTH / bufferLength) * 2.5;
  });

  const renderFrame = () => {
    requestAnimationFrame(renderFrame);
    if (audioInitialized) {
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
  }

  renderFrame();
});