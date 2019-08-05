import { SET_SELECTION_TIME } from "../actions/types";

export default (state = {}, action) => {
  console.log("SETTING TIME",action.payload)
  switch (action.type) {
    case SET_SELECTION_TIME:
      return {last_selection_time:action.payload};
    default:
      return state;
  }
};
