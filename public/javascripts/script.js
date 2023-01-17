const socket_backend = io();

navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    console.log({ stream })
    if (!MediaRecorder.isTypeSupported('audio/webm'))
    
    return alert('Browser not supported')
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
    })

    const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
      'token',
      '47568cc2314f5bdbb3f9768a139ae84df01201f5',
    ])

    socket.onopen = () => {
      document.querySelector('#status').textContent = 'Connected'
      console.log({ event: 'onopen' })
      mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (event.data.size > 0 && socket.readyState == 1) {
          socket.send(event.data)
        }
      })
      mediaRecorder.start(1000)
    }

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data)
      const transcript = received.channel.alternatives[0].transcript
      if (transcript && received.is_final) {
        socket_backend.emit("voice", transcript);
      }
    }

    socket.onclose = () => {
      console.log({ event: 'onclose' })
    }

    socket.onerror = (error) => {
      console.log({ event: 'onerror', error })
    }
  })


function say(m) {
    console.log("Real Time Transcriprion: ",m)
    var msg = new SpeechSynthesisUtterance();
    var voices = window.speechSynthesis.getVoices();
    msg.voice = voices[10];
    msg.voiceURI = "native";
    msg.volume = 1;
    msg.rate = 1;
    msg.pitch = 0.8;
    msg.text = m;
    msg.lang = 'en';
    speechSynthesis.speak(msg);
}

socket_backend.on("voice",(data)=>{
    document.getElementById("convert_text").innerHTML = data;
    say(data)
})
