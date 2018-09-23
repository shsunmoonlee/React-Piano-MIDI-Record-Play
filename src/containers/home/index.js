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
  onClickPlayRecording,
  updateRecording,
} from 'modules/record'

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
  first: MidiNumbers.fromNote('c1'),
  last: MidiNumbers.fromNote('b7'),
};
// console.log('MidiNumbers.fromNote(c3)', MidiNumbers.fromNote('c3'))

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: MidiNumbers.fromNote('c3'), //noteRange.first
  lastNote: MidiNumbers.fromNote('b4'), //noteRange.last
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      recordButtonText: 'Record',
    }
  }
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
  onClickPlayRecording(recording) {
    // this.props.onClickPlayRecording()
    recording.map(input => {
      this.props.instrument.play(input.midiNumber, audioContext.currentTime + input.currentTime)
    })
  }
  render() {
    return (
      <div>
        <h1>React Piano MIDI Record Play</h1>
        <div className="mt-5">
          <DimensionsProvider>
            {({ containerWidth, containerHeight }) => (
            <SoundfontProvider
              instrumentName="acoustic_grand_piano"
              audioContext={audioContext}
              hostname={soundfontHostname}
              render={({ isLoading, playNote, stopNote }) => (
                <Piano
                  audioContext={audioContext}
                  noteRange={noteRange}
                  width={containerWidth}
                  onPlayNote={playNote}
                  onStopNote={stopNote}
                  disabled={isLoading}
                  keyboardShortcuts={keyboardShortcuts}
                />
            )}
          />
          )}
        </DimensionsProvider>
        </div>
        <button onClick={() => this.onClickRecord()}>{this.state.recordButtonText}</button>
        { this.props.recordings.length !== 0 &&
          this.props.recordings.map(
            recording => {
              return (
                <div>
                  <input type="text" value={recording.name} onChange={(e) => this.props.updateRecording(recording, e.target.value)} />
                  <button key={`${recording.name} key`} disabled={this.props.isRecording} onClick={() => this.onClickPlayRecording(recording.input)}>play</button>
                </div>
              )
            }
            )
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
  isPlayRecording: state.record.isPlayRecording,
  isRecording: state.record.isRecording,
  recording: state.record.recording,
  instrument: state.record.instrument,
  recordings: state.record.recordings,
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClickRecord: (input) => dispatch(onClickRecord(input)),
  onClickFinishRecording: (recording) => dispatch(onClickFinishRecording(recording)),
  onClickPlayRecording: () => dispatch(onClickPlayRecording()),
  updateRecording: (recording, name) => dispatch(updateRecording(recording, name))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
