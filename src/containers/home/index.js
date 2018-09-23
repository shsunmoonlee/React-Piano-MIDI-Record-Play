import React, {Fragment} from 'react'
import ReactDOM from 'react-dom';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'components/Piano';
// import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';
import WebMidi from 'webmidi'

import DimensionsProvider from 'components/DimensionsProvider';
import SoundfontProvider from 'components/SoundfontProvider';
import './styles.css';

import { push } from 'connected-react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  onClickRecord,
  onClickFinishRecording,
  onClickPlayRecording
} from 'modules/record'

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

// for recording
const analyser = audioContext.createAnalyser();
const oscillator = audioContext.createOscillator();
oscillator.connect(audioContext.destination);
const mediaStreamDestination = audioContext.createMediaStreamDestination();
const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
oscillator.connect(mediaStreamDestination);
let chunks = [];







// const pitchSamples = [];
let audioReady = false;
const length = 2;
const eps = 0.01;

const tetris = [
  [76, 4], [71, 8], [72, 8], [74, 4], [72, 8], [71, 8], [69, 4], [69, 8], [72, 8], [76, 4], [74, 8], [72, 8], [71, 4], [71, 8], [72, 8], [74, 4], [76, 4], [72, 4], [69, 4], [69, 4], [0,  4], [74, 3], [77, 8],[81, 4], [79, 8], [77, 8], [76, 3], [72, 8], [76, 4], [74, 8], [72, 8], [71, 4], [71, 8], [72, 8], [74, 4], [76, 4], [72, 4], [69, 4], [69, 4], [0, 4],
]


navigator.getUserMedia(
  {audio: true},
  stream => {
    // console.log("===getUserMedia stream", stream)
    audioContext.createMediaStreamSource(stream).connect(analyser);
    audioReady = true;
  },
  err => console.log(err)
);


function playTetris() {
  // getOrCreateContext();
  oscillator.start(0);
  var time = audioContext.currentTime + eps;
  tetris.forEach(note => {
    const freq = Math.pow(2, (note[0]-69)/12)*440;
    console.log(time);
    oscillator.frequency.setTargetAtTime(0, time - eps, 0.001);
    oscillator.frequency.setTargetAtTime(freq, time, 0.001);
    time += length / note[1];
  });
}



//
// const dataArray = new Uint8Array(analyser.frequencyBinCount);
//
// // const canvasContext = refs.canvas.getContext('2d');
// // canvasContext.fillStyle = 'firebrick';
//
// const drawWave = () => { // this gets called via requestAnimationFrame, so runs roughly every 16ms
//   analyser.getByteTimeDomainData(dataArray);
//
//   let lastPos = 0;
//   dataArray.forEach((item, i) => {
//     if (item > 128 && lastItem <= 128) { // we have crossed below the mid point
//       const elapsedSteps = i - lastPos; // how far since the last time we did this
//       lastPos = i;
//
//       const hertz = 1 / (elapsedSteps / 44100);
//       pitchSamples.push(hertz); // an array of every pitch encountered
//     }
//
//     canvasContext.fillRect(i, item, 1, 1); // point in the wave
//
//     lastItem = item;
//   });
// };
//
// const renderAudio = () => {
//   requestAnimationFrame(renderAudio);
//
//   if (!audioReady) return;
//
//   canvasContext.clearRect(0, 0, 1024, 300);
//
//   drawWave();
// };
//
// renderAudio(); // kick the whole thing off
//
// setInterval(() => {
//   renderKey(pitchSamples); // defined elsewhere, will get the average pitch and render a key
// }, 250);








const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('f4'),
};
// console.log('MidiNumbers.fromNote(c3)', MidiNumbers.fromNote('c3'))

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      recordButtonText: 'Record',
      recordButton2: 'mediaRecorder',
      recording: [],
      clicked: false,
    }

    mediaRecorder.ondataavailable = function(evt) {
      // push each chunk (blobs) in an array
      chunks.push(evt.data);
    };

    mediaRecorder.onstop = function(evt) {
      // Make blob out of our blobs, and open it.
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      document.querySelector("audio").src = URL.createObjectURL(blob);
    };


    // examine available input devices
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      // console.log("===available MIDI input devices", devices)
      // devices.forEach(function(device) {
      //   let menu = document.getElementById("inputdevices");
      //   if (device.kind == "audioinput") {
      //     let item = document.createElement("option");
      //     item.innerHTML = device.label;
      //     item.value = device.deviceId;
      //     menu.appendChild(item);
      //   }
      // });
    });



    // MIDI.Player.removeListener(); // removes current listener.
    // MIDI.Player.addListener(function(data) { // set it to your own function!
    //     var now = data.now; // where we are now
    //     var end = data.end; // time when song ends
    //     var channel = data.channel; // channel note is playing on
    //     var message = data.message; // 128 is noteOff, 144 is noteOn
    //     var note = data.note; // the note
    //     var velocity = data.velocity; // the velocity of the note
    //     // then do whatever you want with the information!
    // });
  }  // end of constructor

  // record() {
  //   if(!this.state.recording) {
  //     MIDI.startRecording()
  //     this.setState({recording: true, recordButton: 'Stop Recording'})
  //   } else {
  //     MIDI.stopRecording()
  //     this.setState({recording: false, recordButton: 'Record'})
  //   }
  // }

  // onClickRecordButton1() {
  //   this.setState((state, props) => {
  //     return {
  //       recordButton1Clicked: !state.recordButton1Clicked,
  //       recordButton1: state.recordButton1Clicked ? 'Record' : 'Stop',
  //     }
  //   })
  // }
  onClickRecord() {
    // to get offset audioContext.currentTime - startTime
    // startRecording
    if(!this.props.isRecording) {
      const startTime = audioContext.currentTime;
      this.props.onClickRecord(startTime)
      this.setState((state, props) => {
        return {
          recordButtonText: 'Stop'
        }
      })
    } else { // click Stop. finish Recording
      this.props.onClickFinishRecording()
      this.setState((state, props) => {
        return {
          recordButtonText: 'Record'
        }
      })
    }

  }
  // record(input) {
  //   this.setState((state, props) => {
  //     console.log("===recording, input", state.recording, input)
  //     return {
  //       recording: [...state.recording, input]
  //     }
  //   })
  // }

  // recordOnClick(e) {
  //   if (!this.state.clicked) {
  //       mediaRecorder.start();
  //       osc.start(0);
  //       e.target.innerHTML = "Stop recording";
  //       clicked = true;
  //     } else {
  //       mediaRecorder.stop();
  //       osc.stop(0);
  //       e.target.disabled = true;
  //     }
  // }
  onClickRecordButton2(e) {
    if (!this.state.recordButtonClicked) {
      mediaRecorder.start();
      oscillator.start(0);
      this.setState({recordButton2: "Stop", recordButtonClicked: true})
      // this.setState((state, props) => {
      //   return {
      //     recording: state.recording.push({
      //       midiNumber,
      //       duration: 1,
      //       currentTime: audioContext.currentTime,
      //     })
      //   }
      // })
    } else {
      mediaRecorder.stop();
      oscillator.stop(0);
    }
  }
  onClickPlayRecording(recording) {
    recording.map(input => {
      this.props.instrument.play(input.midiNumber, audioContext.currentTime + input.currentTime)
    })
  }
  render() {
    const { recording } = this.state
    // console.log("===recording", recording)
    const Recordings = <Fragment>{this.props.recordings.map(recording => <div><meta>{recording.name}</meta><button key={recording.name + 'key'} onClick={() => this.onClickPlayRecording(recording.input)}>play</button></div>)}</Fragment>
    return (
      <div>
        <h1>react-piano demos</h1>
        <div className="mt-5">
          <p>Basic piano with hardcoded width</p>
          <SoundfontProvider
            instrumentName="acoustic_grand_piano"
            audioContext={audioContext}
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }) => (
              <Piano
                audioContext={audioContext}
                noteRange={noteRange}
                width={300}
                onPlayNote={playNote}
                onStopNote={stopNote}
                disabled={isLoading}
                keyboardShortcuts={keyboardShortcuts}
              />
            )}
          />
        </div>
        <button onClick={() => this.onClickRecord()}>{this.state.recordButtonText}</button>
        <button onClick={(e) => this.onClickRecordButton2(e)}>{this.state.recordButton2}</button>
        { (this.props.recordings.length !== 0 && !this.props.isRecording) &&
          <Recordings />
        }
      </div>
    );
  }
}

// <div className="mt-5">
//   <p>Piano with custom styling - see styles.css</p>
//   <ResponsivePiano className="PianoDarkTheme" />
// </div>

// function BasicPiano() {
//   return (
//     <SoundfontProvider
//       instrumentName="acoustic_grand_piano"
//       audioContext={audioContext}
//       hostname={soundfontHostname}
//       render={({ isLoading, playNote, stopNote }) => (
//         <Piano
//           audioContext={audioContext}
//           record={this.record}
//           noteRange={noteRange}
//           width={300}
//           onPlayNote={playNote}
//           onStopNote={stopNote}
//           disabled={isLoading}
//           keyboardShortcuts={keyboardShortcuts}
//         />
//       )}
//     />
//   );
// }
//
// function ResponsivePiano(props) {
//   return (
//     <DimensionsProvider>
//       {({ containerWidth, containerHeight }) => (
//         <SoundfontProvider
//           instrumentName="acoustic_grand_piano"
//           audioContext={audioContext}
//           hostname={soundfontHostname}
//           render={({ isLoading, playNote, stopNote }) => (
//             <Piano
//               noteRange={noteRange}
//               width={containerWidth}
//               onPlayNote={playNote}
//               onStopNote={stopNote}
//               disabled={isLoading}
//             />
//           )}
//         />
//       )}
//     </DimensionsProvider>
//   );
// }

function ResponsivePiano(props) {
  return (
    <DimensionsProvider>
      {({ containerWidth, containerHeight }) => (
        <SoundfontProvider
          instrumentName="acoustic_grand_piano"
          audioContext={audioContext}
          hostname={soundfontHostname}
          render={({ isLoading, playNote, stopNote }) => (
            <Piano
              noteRange={noteRange}
              width={containerWidth}
              onPlayNote={playNote}
              onStopNote={stopNote}
              disabled={isLoading}
              {...props}
            />
          )}
        />
      )}
    </DimensionsProvider>
  );
}


const mapStateToProps = (state, ownProps) => {
  console.log("===redux state", state)
  return {
  // active: ownProps.filter === state.visibilityFilter
  isPlayRecording: state.record.isPlayRecording,
  isRecording: state.record.isRecording,
  recording: state.record.recording,
  instrument: state.record.instrument,
  recordings: state.record.recordings,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  // onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  onClickRecord: (input) => dispatch(onClickRecord(input)),
  onClickFinishRecording: (recording) => dispatch(onClickFinishRecording(recording)),
  onClickPlayRecording: () => dispatch(onClickPlayRecording()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)


// const Home = props => (
//   <div>
//     <h1>Home</h1>
//     <p>Count: {props.count}</p>
//
//     <p>
//       <button onClick={props.increment}>Increment</button>
//       <button onClick={props.incrementAsync} disabled={props.isIncrementing}>
//         Increment Async
//       </button>
//     </p>
//
//     <p>
//       <button onClick={props.decrement}>Decrement</button>
//       <button onClick={props.decrementAsync} disabled={props.isDecrementing}>
//         Decrement Async
//       </button>
//     </p>
//
//     <p>
//       <button onClick={() => props.changePage()}>
//         Go to about page via redux
//       </button>
//     </p>
//   </div>
// )

// const mapDispatchToProps = dispatch =>
//   bindActionCreators(
//     {
//       increment,
//       incrementAsync,
//       decrement,
//       decrementAsync,
//       changePage: () => push('/about-us')
//     },
//     dispatch
//   )
