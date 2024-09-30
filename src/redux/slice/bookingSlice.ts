import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import envConfig from '../../env';
import axios from "axios";

export interface IBooking {
  fromAddress: string;
  toAddress: string;
  fromLat: string;
  fromLng: string,
  toLat: string;
  toLng: string,
  cost: number,
  distance: number,
  type: string,
  products: Array<any>,
}

export const initialState: IBooking = {
  fromAddress: '',
  toAddress: '',
  fromLat: '',
  fromLng: '',
  toLat: '',
  toLng: '',
  cost: 0,
  distance: 0,
  type: 'delivery',
  products: [],

};

export const getUser: any = createAsyncThunk('user/getUser', async () => {
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
    console.log(error);

    throw new Error('Something went wrong');
  }
});

export const createBooking: any = createAsyncThunk('booking/create', async ({ fromAddress, toAddress, fromLat, fromLng, toLat, toLng, cost, distance,type,products }: IBooking, { rejectWithValue }): Promise<any> => {
  try {
    const response = await axios.post(
      `${envConfig.API_URL}booking`,
      {
        fromAddress,
        toAddress,
        fromLat,
        fromLng,
        toLat,
        toLng,
        cost,
        distance,
        type,
        products
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('medtou-accesstoken')}`,
        },
      }
    );

    // Kiểm tra phản hồi từ backend, nếu có lỗi, ném ra lỗi để xử lý ở catch
    if (!response.data?.status) {
      throw new Error(response.data?.message || 'Booking failed');
    }

    // Trả về dữ liệu khi thành công
    return response.data;
  } catch (error: any) {
    // Nếu axios gặp lỗi, trả về message từ response hoặc lỗi mặc định
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return rejectWithValue({ message: errorMessage });
  }
})

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(createBooking.fulfilled, (state, action) => {
        // Có thể cập nhật state tại đây nếu cần
        console.log("Booking successful:", action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        // Xử lý khi booking thất bại, lấy thông báo lỗi từ backend
        console.error("Booking failed:", action.payload?.message || action.error.message);
      });
  },
});

export default bookingSlice.reducer;
