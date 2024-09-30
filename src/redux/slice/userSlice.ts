import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import envConfig from '../../env';

export interface IUser {
  user: string;
  isLogin: boolean;
}

export const initialState: IUser = {
  user: '',
  isLogin: false,
};

export const getUser : any = createAsyncThunk('user/getUser', async () => {
  try {
    const response = await fetch(envConfig.API_URL + 'user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('medtou-accesstoken')}`,
      },
    });
    const data = await response.json();

    if (!response.ok || !data?.status) { 
      throw new Error('Network response was not ok');
    }
    return data.data;
  } catch (error) {
    throw new Error('Something went wrong');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLogin = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.isLogin = false;
        // state.user = initialState
      });
  },
});

export default userSlice.reducer;
