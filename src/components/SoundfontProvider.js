// See https://github.com/danigb/soundfont-player
// for more documentation on prop options.
import React from 'react';
import PropTypes from 'prop-types';
import Soundfont from 'soundfont-player';
import { connect } from 'react-redux'
import {
  record,
  registerInstrument
} from 'modules/record'
class SoundfontProvider extends React.Component {
  static propTypes = {
    instrumentName: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    format: PropTypes.oneOf(['mp3', 'ogg']),
    soundfont: PropTypes.oneOf(['MusyngKite', 'FluidR3_GM']),
    audioContext: PropTypes.instanceOf(window.AudioContext),
    render: PropTypes.func,
  };

  static defaultProps = {
    format: 'mp3',
    soundfont: 'MusyngKite',
    instrumentName: 'acoustic_grand_piano',
  };

  constructor(props) {
    super(props);
    this.state = {
      activeAudioNodes: {},
      instrument: null,
      recording: [],
    };
  }

  componentDidMount() {
    this.loadInstrument(this.props.instrumentName);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.instrumentName !== this.props.instrumentName) {
      this.loadInstrument(this.props.instrumentName);
    }
  }

  loadInstrument = instrumentName => {
    // Re-trigger loading state
    this.setState({
      instrument: null,
    });
    Soundfont.instrument(this.props.audioContext, instrumentName, {
      format: this.props.format,
      soundfont: this.props.soundfont,
      nameToUrl: (name, soundfont, format) => {
        return `${this.props.hostname}/${soundfont}/${name}-${format}.js`;
      },
    }).then(instrument => {
      this.props.registerInstrument(instrument)
      this.setState({
        instrument,
      });
    });
  };

  playNote = midiNumber => {
    this.props.audioContext.resume().then(() => {
      const audioNode = this.state.instrument.play(midiNumber);
      this.setState((state, props) => {
        return
          {
            activeAudioNodes: Object.assign({}, state.activeAudioNodes, {
              [midiNumber]: audioNode,
            })
          }
      });

      // recording part
      if(this.props.isRecording) {
        //   this.setState((state, props) => {
        //     console.log("===recording, input", state.recording, input)
        //     return {
        //       recording: [...state.recording, {midiNumber, currentTime: this.props.audioContext.currentTime - this.props.startRecordingTime}]
        //     }
        //   })
        this.props.record({midiNumber, currentTime: this.props.audioContext.currentTime - this.props.startRecordingTime})
      }
      // if(this.props.isRecording) {
      //   this.setState((state, props) => {
      //     console.log("===recording, input", state.recording, input)
      //     return {
      //       recording: [...state.recording, {midiNumber, currentTime: this.props.audioContext.currentTime - this.props.startRecordingTime}]
      //     }
      //   })
      // }
      // // finished recording
      // if(!this.props.isRecording && this.state.recording) {
      // }
    });
  };

  stopNote = midiNumber => {
    this.props.audioContext.resume().then(() => {
      if (!this.state.activeAudioNodes[midiNumber]) {
        return;
      }
      const audioNode = this.state.activeAudioNodes[midiNumber];
      audioNode.stop();
      this.setState((state, props) => {
        return
          {
            activeAudioNodes: Object.assign({}, state.activeAudioNodes, {
              [midiNumber]: null,
            })
          }
      });
    });
  };

  // Clear any residual notes that don't get called with stopNote
  stopAllNotes = () => {
    this.props.audioContext.resume().then(() => {
      const activeAudioNodes = Object.values(this.state.activeAudioNodes);
      activeAudioNodes.forEach(node => {
        if (node) {
          node.stop();
        }
      });
      this.setState({
        activeAudioNodes: {},
      });
    });
  };

  render() {
    return this.props.render({
      isLoading: !this.state.instrument,
      playNote: this.playNote,
      stopNote: this.stopNote,
      stopAllNotes: this.stopAllNotes,
    });
  }
}
const mapStateToProps = (state, ownProps) => ({
  startRecordingTime: state.record.startRecordingTime,
  recording: state.record.recording,
  isPlayRecording: state.record.isPlayRecording,
  isRecording: state.record.isRecording,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  // onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
  record: (input) => dispatch(record(input)),
  registerInstrument: (instrument) => dispatch(registerInstrument(instrument)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SoundfontProvider)
