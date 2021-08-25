import axios from 'axios';

export const httpClient = axios.create({
    baseURL: ''
});

httpClient.interceptors.response.use(
    undefined,
    () => ({ data: undefined })
);
