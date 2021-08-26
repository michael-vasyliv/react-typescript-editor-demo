/* eslint-disable @typescript-eslint/comma-dangle */
import axios from 'axios';

export const httpClient = axios.create({
    baseURL: ''
});

httpClient.interceptors.response.use(
    undefined,
    () => new Promise((resolve) => {
        // throw new Error('123');
        setTimeout(() => {
            resolve({
                data: {
                    url: 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'
                }
            });
        }, 400);
    })
);
