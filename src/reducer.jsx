export const initialState = {
  stags: [],
  bullstags: [],
  cocks: [],
  toprankStags: [],
  toprankBullstags: [],
  toprankCocks: [],
};

export const actionTypes = {
  SET_STAGS: "SET_STAGS",
  SET_BULLSTAGS: "SET_BULLSTAGS",
  SET_COCKS: "SET_COCKS",
  SET_TOPRANKSTAGS: "SET_TOPRANKSTAGS",
  SET_TOPRANKBULLSTAGS: "SET_TOPRANKBULLSTAGS",
  SET_TOPRANKCOCKS: "SET_TOPRANKCOCKS",
  ADD_TO_STAGS: "ADD_TO_STAGS",
  ADD_TO_BULLSTAGS: "ADD_TO_BULLSTAGS",
  ADD_TO_COCKS: "ADD_TO_COCKS",
  ADD_TO_TOPRANKSTAGS: "ADD_TO_TOPRANKSTAGS",
  ADD_TO_TOPRANKBULLSTAGS: "ADD_TO_TOPRANKBULLSTAGS",
  ADD_TO_TOPRANKCOCKS: "ADD_TO_TOPRANKCOCKS",
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TO_STAGS:
      // Check if payload is an empty array
      if (action.payload.length === 0) {
        return state; // Do not update the state if the payload is an empty array
      }
      return {
        ...state,
        stags: [...state.stags, action.payload], // Add to the stags array
      };
    case actionTypes.ADD_TO_BULLSTAGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        bullstags: [...state.stags, action.payload],
      };
    case actionTypes.ADD_TO_COCKS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        cocks: [...state.cocks, action.payload],
      };
    case actionTypes.ADD_TO_TOPRANKSTAGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        toprankStags: [...state.toprankStags, action.payload],
      };
    case actionTypes.ADD_TO_TOPRANKBULLSTAGS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        toprankBullstags: [...state.toprankBullstags, action.payload],
      };
    case actionTypes.ADD_TO_TOPRANKCOCKS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        toprankCocks: [...state.toprankCocks, action.payload],
      };
    default:
      return state;
  }
};

export default reducer;
