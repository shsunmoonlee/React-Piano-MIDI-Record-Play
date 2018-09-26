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
// import gql from 'graphql-tag';
import ApolloClient, { gql } from 'apollo-boost';

import { Query, Mutation } from 'react-apollo';
import axios from 'axios';
import {
  onClickRecord,
  onClickFinishRecording,
  onClickPlayRecording,
  updateRecording,
} from 'modules/record'
import {client} from 'index' // src/index.js
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

const GET_RECORDINGS = gql`{
  recordings {
    id
    title
    input {
      midiNumber
      currentTime
    }
  }
}`
const ADD_RECORDING = gql`
  mutation($title: String!, $input: [AudioInputInput!]! ) {
    addRecording(title: $title, input: $input) {
        title
        input {
          midiNumber
          currentTime
        }
    }
  }
`;

const UPDATE_RECORDINGS = gql`
mutation($recordings: RecordingsInput ) {
  updateRecordings(recordings: $recordings) {
    recordings {
      title
      input {
        midiNumber
        currentTime
      }
    }
  }
}
`;
// const axiosGraphQL = axios.create({
//   baseURL: 'http://localhost:4000',
// });
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      recordButtonText: 'Record',
      graphqlRecordings: [],
    }
  }
  componentDidMount() {
    client
      .query({
        query: GET_RECORDINGS,
        // variables: {
        //   organization: 'the-road-to-learn-react',
        // },
      })
      .then(response => {
        console.log("===GET_RECORDINGS QUERY RESULT data", response)
        this.setState({graphqlRecordings: response.data.recordings})
      });
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
      console.log("===right before mutation recordings, recording", this.props.recordings, this.props.recording)
      client
        .mutate({
          mutation: ADD_RECORDING,
          variables: {
            title: `recording ${this.props.recordings.length + 1}`,
            input: this.props.recording,
          },
        })
        .then(response => {
          console.log("===mutation result", response)

          // update
          client
            .query({
              query: GET_RECORDINGS,
            })
            .then(response => {
              console.log("===GET_RECORDINGS QUERY RESULT data", response)
              this.setState({graphqlRecordings: response.data.recordings})
            });


        });


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
  updateRecording(recording, title) {
    this.props.updateRecording(recording, title) // update local redux store
    // const cleanedRecordingInput = recording.input.map(obj => {
    //   return {
    //     midiNumber: obj.midiNumber,
    //     currentTime: obj.currentTime
    //   }
    // })
    // console.log("===this.props.recordings", this.props.recordings)
    // client
    //   .mutate({
    //     mutation: UPDATE_RECORDINGS,
    //     variables: {
    //       recordings: this.props.recordings
    //     },
    //   })
    //   .then(response => {
    //     console.log("===mutation result", response)
    //   });
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



{/*
  <Mutation mutation={ADD_RECORDINGS} variables={{ title: 'testing mutation recordign title1', input: [{midiNumber: 1, currentTime: 1}] }}>
    {(addRecording) => (
      <button
        className={'RepositoryItem-title-action'}
        onClick={addRecording}
      >
        Record
      </button>
    )}
  </Mutation>


  <Query query={GET_RECORDINGS}>
          {({ data, loading }) => {
            // const { viewer } = data;
            console.log("===GET_RECORDINGS QUERY RESULT data", data)
            // if (loading || !viewer) {
            //   return <div>Loading ...</div>;
            // }
            if (loading) {
              return <div>Loading ...</div>;
            }
            return (
              <div>
                get_recordings_result query
              </div>
            );
          }}
        </Query>
*/}


        <h1>Redux Recordings</h1>
        { this.props.recordings.length !== 0 &&
          this.props.recordings.map(
            recording => {
              return (
                <div>
                  <input type="text" value={recording.title} onChange={(e) => this.updateRecording(recording, e.target.value)} />
                  <button key={`${recording.title} key`} disabled={this.props.isRecording} onClick={() => this.onClickPlayRecording(recording.input)}>play</button>
                </div>
              )
            }
            )
        }


        <h1>Graphql Recordings</h1>
        { this.state.graphqlRecordings.length !== 0 &&
          this.state.graphqlRecordings.map(
            recording => {
              return (
                <div>
                  <input type="text" value={recording.title} onChange={(e) => this.updateRecording(recording, e.target.value)} />
                  <button key={`${recording.title} key`} disabled={this.props.isRecording} onClick={() => this.onClickPlayRecording(recording.input)}>play</button>
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
