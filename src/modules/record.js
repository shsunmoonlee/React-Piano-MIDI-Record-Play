const initialState = {
  audioContext : new (window.AudioContext || window.webkitAudioContext)(),
  isRecording: false,
  startRecordingTime: 0,
  isPlayRecording: false,
  instrument: null,
  recording: [],
  recordings: [],
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'updateRecording':
      const index = state.recordings.findIndex(recording => recording === action.recording)
      return {
        ...state,
        recordings: [...state.recordings.slice(0, index), {name: action.name, input: action.recording.input}, ...state.recordings.slice(index+1)]
      }
    case 'onClickPlayRecording':
      return {
        ...state,
        isPlayRecording: !state.isPlayRecording
      }
    case 'registerInstrument':
      return {
        ...state,
        instrument: action.instrument
      }
    case 'record':
      return {
        ...state,
        recording: [...state.recording, action.input]
      }
    case 'onClickRecord':
      return {
        ...state,
        startRecordingTime: action.startRecordingTime,
        isRecording: !state.isRecording
      }
    case 'onClickFinishRecording':
      return {
        ...state,
        recordings: [...state.recordings, {name: `recording ${state.recordings.length + 1}`, input: state.recording}],
        recording: [],
        isRecording: !state.isRecording
      }
    default:
      return state
  }
}
export const updateRecording = (recording, name) => {
  return dispatch => {
    dispatch({
      type: 'updateRecording',
      recording,
      name
    })
  }
}
export const registerInstrument = (instrument) => {
  return dispatch => {
    dispatch({
      type: 'registerInstrument',
      instrument
    })
  }
}
export const onClickPlayRecording = () => {
  return dispatch => {
    dispatch({
      type: 'onClickPlayRecording',
    })
  }
}
export const record = (input) => {
  return dispatch => {
    dispatch({
      type: 'record',
      input
    })
  }
}
export const onClickRecord = (startTime) => {
  return dispatch => {
    dispatch({
      type: 'onClickRecord',
      startRecordingTime: startTime,
    })
  }
}
export const onClickFinishRecording = () => {
  return dispatch => {
    dispatch({
      type: 'onClickFinishRecording',
    })
  }
}
