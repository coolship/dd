import { FETCH_DEMO_DATASETS } from "../actions/types";

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_DEMO_DATASETS:
      return Object.assign({},action.payload);
    default:
      return state;
  }
};
