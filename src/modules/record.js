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
