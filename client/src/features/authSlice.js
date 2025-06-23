import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    userLoggedout: (state) => {
      (state.user = null), (state.isAuthenticated = false);
    },
  },
});

export const { userLoggedIn, userLoggedout } = authSlice.actions;
export default authSlice.reducer;
