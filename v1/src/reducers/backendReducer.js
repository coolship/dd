import { } from "../actions/types";

export default (state = {
    resolution:5000,
    datamax:50,
    scale_factor:100,
}, action) => {
    switch (action.type) {
    default:
	return state;
    }
}
