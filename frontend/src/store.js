import {combineReducers,applyMiddleware} from "redux";
import { legacy_createStore as createStore} from 'redux'
import thunk from "redux-thunk";
import {composeWithDevTools} from "redux-devtools-extension";
import { allUsersReducer, forgotPasswordReducer, myBalancesReducer, profileReducer, userReducer } from "./reducers/userReducer";
import { addMemberReducer, createGroupReducer, deleteMemberReducer, groupBalancesReducer, groupDetailsReducer, groupReducer, updateGroupReducer } from "./reducers/groupReducer";


const reducer=combineReducers({
    user:userReducer,
    profile:profileReducer,
    forgotPassword:forgotPasswordReducer,
    groups:groupReducer,
    myBalances:myBalancesReducer,
    newGroup:createGroupReducer,
    groupDetail:groupDetailsReducer,
    groupBalances:groupBalancesReducer,
    updateGroup:updateGroupReducer,
    addMember:addMemberReducer,
    allUsers:allUsersReducer,
    deleteMember:deleteMemberReducer,
});

let initialState={
    myBalances:{
        myBalances:localStorage.getItem("balances")
            ? JSON.parse(localStorage.getItem("balances"))
            : [],
    }
};


const middleware=[thunk];

const store=createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleware)));

export default store;