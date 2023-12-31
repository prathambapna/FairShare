import {LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    CLEAR_ERRORS,
    REGISTER_USER_REQUEST,
    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAIL,
    LOAD_USER_REQUEST,
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
    UPDATE_PROFILE_REQUEST,
    UPDATE_PROFILE_SUCCESS,
    UPDATE_PROFILE_FAIL,
    UPDATE_PASSWORD_REQUEST,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_FAIL,
    FORGOT_PASSWORD_REQUEST,
    FORGOT_PASSWORD_SUCCESS,
    FORGOT_PASSWORD_FAIL,
    RESET_PASSWORD_REQUEST,
    RESET_PASSWORD_SUCCESS,
    RESET_PASSWORD_FAIL,
    MY_BALANCES_REQUEST,
    MY_BALANCES_SUCCESS,
    MY_BALANCES_FAIL,
    ALL_USERS_REQUEST,
    ALL_USERS_SUCCESS,
    ALL_USERS_FAIL,
    REMOVE_AVATAR_REQUEST,
    REMOVE_AVATAR_SUCCESS,
    REMOVE_AVATAR_FAIL,
    MY_TRANSACTIONS_REQUEST,
    MY_TRANSACTIONS_SUCCESS,
    MY_TRANSACTIONS_FAIL,
} from "../constants/userConstants";
import axios from "axios";


//login
export const login = (email,password) => async(dispatch)=>{
    try {
        dispatch({type:LOGIN_REQUEST});

        const config={headers :{"Content-Type":"application/json"}};
        const {data}=await axios.post(
            `/api/v1/login`,
            {email,password},
            config,
        );
        dispatch({
            type:LOGIN_SUCCESS,
            payload:data.user,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:LOGIN_FAIL,
            payload:error.response.data.message,
        })
    }
};

//register
export const register = (userData) => async(dispatch)=>{
    try {
        dispatch({type:REGISTER_USER_REQUEST});

        const config={headers :{"Content-Type":"multipart/form-data"}};
        const {data}=await axios.post(
            `/api/v1/register`,
            userData,
            config,
        );
        dispatch({
            type:REGISTER_USER_SUCCESS,
            payload:data.user,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:REGISTER_USER_FAIL,
            payload:error.response.data.message,
        });
    }
};

//loadUser
export const loadUser = () => async(dispatch)=>{
    try {
        dispatch({type:LOAD_USER_REQUEST});

        const {data}=await axios.get(`/api/v1/me`);
        dispatch({
            type:LOAD_USER_SUCCESS,
            payload:data.user,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:LOAD_USER_FAIL,
            payload:error.response.data.message,
        })
    }
};

//logout user
export const logout = () => async(dispatch)=>{
    try {
        
        await axios.get(`/api/v1/logout`);
        dispatch({
            type:LOGOUT_SUCCESS,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:LOGOUT_FAIL,
            payload:error.response.data.message,
        })
    }
};


//update profile
export const updateProfile = (userData) => async(dispatch)=>{
    try {
        dispatch({type:UPDATE_PROFILE_REQUEST});

        const config={headers :{"Content-Type":"multipart/form-data"}};
        const {data}=await axios.put(
            `/api/v1/me/update`,
            userData,
            config,
        );
        dispatch({
            type:UPDATE_PROFILE_SUCCESS,
            payload:data.success,
        })

    } catch (error) {
        dispatch({
            type:UPDATE_PROFILE_FAIL,
            payload:error.response.data.message,
        });
    }
};


//update password
export const updatePassword = (passwords) => async(dispatch)=>{
    try {
        dispatch({type:UPDATE_PASSWORD_REQUEST});

        const config={headers :{"Content-Type":"application/json"}};
        const {data}=await axios.put(
            `/api/v1/password/update`,
            passwords,
            config,
        );
        dispatch({
            type:UPDATE_PASSWORD_SUCCESS,
            payload:data.success,
        })

    } catch (error) {
        dispatch({
            type:UPDATE_PASSWORD_FAIL,
            payload:error.response.data.message,
        });
    }
};


//forgot password
export const forgotPassword = (email) => async(dispatch)=>{
    try {
        dispatch({type:FORGOT_PASSWORD_REQUEST});

        const config={headers :{"Content-Type":"application/json"}};
        const {data}=await axios.post(
            `/api/v1/password/forgot`,
            email,
            config,
        );
        dispatch({
            type:FORGOT_PASSWORD_SUCCESS,
            payload:data.message,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:FORGOT_PASSWORD_FAIL,
            payload:error.response.data.message,
        })
    }
};


//reset password
export const resetPassword = (token,passwords) => async(dispatch)=>{
    try {
        dispatch({type:RESET_PASSWORD_REQUEST});

        const config={headers :{"Content-Type":"application/json"}};
        const {data}=await axios.put(
            `/api/v1/password/reset/${token}`,
            passwords,
            config,
        );
        dispatch({
            type:RESET_PASSWORD_SUCCESS,
            payload:data.success,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:RESET_PASSWORD_FAIL,
            payload:error.response.data.message,
        })
    }
};

//my balances
export const myBalancesAction = () => async(dispatch,getState)=>{
    try {
        dispatch({type:MY_BALANCES_REQUEST});

        const {data}=await axios.get(`/api/v1/me/balances`);
        dispatch({
            type:MY_BALANCES_SUCCESS,
            payload:data.balances,
        })

        localStorage.setItem("balances",JSON.stringify(getState().myBalances.myBalances));

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:MY_BALANCES_FAIL,
            payload:error.response.data.message,
        })
    }
};


//all user details
export const allUsersDetails = () => async(dispatch)=>{
    try {
        dispatch({type:ALL_USERS_REQUEST});

        const {data}=await axios.get(`/api/v1/users`);
        dispatch({
            type:ALL_USERS_SUCCESS,
            payload:data,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:ALL_USERS_FAIL,
            payload:error.response.data.message,
        })
    }
};


//delete group in a group
export const removeAvatar=()=>async(dispatch)=>{
    try {
        dispatch({type:REMOVE_AVATAR_REQUEST});

        const {data}=await axios.delete(`/api/v1/me/removeAvatar`);
        dispatch({
            type:REMOVE_AVATAR_SUCCESS,
            payload:data,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:REMOVE_AVATAR_FAIL,
            payload:error.response.data.message,
        })
    }
}

//my transactions
export const myTransactionsAction = () => async(dispatch,getState)=>{
    try {
        dispatch({type:MY_TRANSACTIONS_REQUEST});

        const {data}=await axios.get(`/api/v1/me/transactions`);
        dispatch({
            type:MY_TRANSACTIONS_SUCCESS,
            payload:data,
        })

        localStorage.setItem("transactions",JSON.stringify(getState().myTransactions.myTransactions));

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:MY_TRANSACTIONS_FAIL,
            payload:error.response.data.message,
        })
    }
};

//clearing errors
export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};