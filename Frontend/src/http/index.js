import axios from "axios";
const API = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});
const APIForAuthenticated = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Dynamically add token before sending a request
APIForAuthenticated.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers["user_auth_token"] = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


export  {API,APIForAuthenticated};
