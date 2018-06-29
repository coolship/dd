import { FETCH_DATASETS } from "../actions/types";

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_DATASETS:
      return action.payload;
    default:
      return state;
  }
};
