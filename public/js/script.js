const socket_backend =  io();

navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(async (stream) => {

	console.log(stream);
	const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
    })

    const socket = new WebSocket('wss://api.deepgram.com/v1/listen', [
      'token',
      '47568cc2314f5bdbb3f9768a139ae84df01201f5',
    ])

    socket.onopen = () => {
      document.querySelector('#status').textContent = 'Connected'
      mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (event.data.size > 0 && socket.readyState == 1) {
          socket.send(event.data)
        }
      })
      mediaRecorder.start(1000)
    }

    socket.onmessage = (message) => {
      const received = JSON.parse(message.data)
      const transcript = received.channel.alternatives[0].transcript;
	  console.log(transcript);
      if (transcript && received.is_final) {
		const room = getQString( location.href, 'room' );
		const data = {
			room : room,
			transcript: transcript
		}
        socket_backend.emit("voice", data);
      }
    }

    socket.onclose = () => {
      console.log({ event: 'onclose' })
    }

    socket.onerror = (error) => {
      console.log({ event: 'onerror', error })
    }
})

function getQString( url = '', keyToReturn = '' ) {
	url = url ? url : location.href;
	let queryStrings = decodeURIComponent( url ).split( '#', 2 )[0].split( '?', 2 )[1];

	if ( queryStrings ) {
		let splittedQStrings = queryStrings.split( '&' );

		if ( splittedQStrings.length ) {
			let queryStringObj = {};

			splittedQStrings.forEach( function ( keyValuePair ) {
				let keyValue = keyValuePair.split( '=', 2 );

				if ( keyValue.length ) {
					queryStringObj[keyValue[0]] = keyValue[1];
				}
			} );

			return keyToReturn ? ( queryStringObj[keyToReturn] ? queryStringObj[keyToReturn] : null ) : queryStringObj;
		}

		return null;
	}

	return null;
}