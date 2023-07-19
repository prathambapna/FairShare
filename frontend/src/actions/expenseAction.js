import {
    CLEAR_ERRORS, 
    CREATE_EXPENSE_FAIL, 
    CREATE_EXPENSE_REQUEST,
    CREATE_EXPENSE_SUCCESS,
} from "../constants/expenseConstants";
import axios from "axios";

//create new expense
export const createExpense=(groupId,groupData)=>async(dispatch)=>{
    try {
        dispatch({type:CREATE_EXPENSE_REQUEST});

        const config={headers :{"Content-Type":"application/json"}};
        const {data}=await axios.post(
            `/api/v1/group/${groupId}/expense/create`,
            groupData,
            config,
        );
        dispatch({
            type:CREATE_EXPENSE_SUCCESS,
            payload:data,
        })

    } catch (error) {
        console.log(error.response.data);
        dispatch({
            type:CREATE_EXPENSE_FAIL,
            payload:error.response.data.message,
        })
    }
}

//clearing errors
export const clearErrors = () => async(dispatch)=>{
    dispatch({type:CLEAR_ERRORS});
};