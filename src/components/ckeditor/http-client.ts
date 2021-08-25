/* eslint-disable @typescript-eslint/comma-dangle */
import axios from 'axios';

export const httpClient = axios.create({
    baseURL: ''
});

httpClient.interceptors.response.use(
    undefined,
    () => ({ data: undefined })
);
