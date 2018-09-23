class PianoSeunghun {
  cnstructor() {

  }
  renderPiano() {

  }
  loadInstrument() {

  }

  record() {

  }
  // Play Piano from array of midiNumbers
  playRecording(instrument, recording = []) {
    // const Examplerecording = [
    //   {midiNumber: 48, activeNotes: [], currentTime: 1},
    //   {midiNumber: 49, activeNotes: [], currentTime: 2},
    //   {midiNumber: 50, activeNotes: [], currentTime: 3},
    //   {midiNumber: 51, activeNotes: [], currentTime: 4},
    //   {midiNumber: 52, activeNotes: [], currentTime: 5},
    //   {midiNumber: 53, activeNotes: [], currentTime: 6},
    //   {midiNumber: 54, activeNotes: [], currentTime: 7},
    //   {midiNumber: 53, activeNotes: [], currentTime: 8},
    //   {midiNumber: 52, activeNotes: [], currentTime: 9},
    //   {midiNumber: 51, activeNotes: [], currentTime: 10},
    //   {midiNumber: 50, activeNotes: [], currentTime: 11},
    // ]
    recording.map(node => {
      console.log("===playRecording node", node)
      instrument.play(node.midiNumber, node.currentTime)
    })
  }
