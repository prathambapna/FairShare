const ErrorHandler=require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncError");
const User=require("../models/userModel");
const Group=require("../models/groupModel");
const UserBalance=require("../models/userBalanceModel");

//create a group
exports.createGroup=catchAsyncErrors(async(req,res,next)=>{
    const {name}=req.body;
    const group=await Group.create({
        name,
        createdAt:Date.now(),
        createdBy:req.user._id,
    });

    //adding the group in user's group list
    const user=await User.findById(req.user._id);
    user.groupList.push(group);
    await user.save({validateBeforeSave:false});

    group.participants.push(user);
    await group.save({validateBeforeSave:false});

    res.status(201).json({
        success:true,
        group,
    })
});


//add user to a group
exports.addUserToGroup=catchAsyncErrors(async(req,res,next)=>{
    const {groupId}=req.params;
    const user=await User.findById(req.body.userId);
    const group=await Group.findById(groupId);

    if(!user){
        return next(new ErrorHandler("User does not exist",400));
    }

    if(!group){
        return next(new ErrorHandler("Group does not exist",400));
    }

    //only user admin can add members
    if(group.createdBy.toString() !== req.user._id.toString()){
        return next(new ErrorHandler("You are not authorised to add user to this group",404));
    }

    //if member alreay present in group
    const isUserExistingInGroup=await group.participants.find((u)=>u.toString()===req.body.userId);
    if(isUserExistingInGroup){
        return next(new ErrorHandler("User already exists in group",400));
    }

    group.participants.push(user);
    await group.save({validateBeforeSave:false});

    user.groupList.push(group);
    await user.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
        user,
    })

});

//remove user from a group
exports.removeUserFromGroup=catchAsyncErrors(async(req,res,next)=>{
    const {userId,groupId}=req.params;

    const user=await User.findById(userId);
    const group=await Group.findById(groupId);

    if(!user){
        return next(new ErrorHandler("User does not exist",400));
    }

    if(!group){
        return next(new ErrorHandler("Group does not exist",400));
    }

    //only user admin can remove members
    if(group.createdBy.toString() !== req.user._id.toString()){
        return next(new ErrorHandler("You are not authorised to remove user from this group",404));
    }

    //if member not present in group
    const isUserExistingInGroup=await group.participants.find((u)=>u.toString()===userId);
    if(!isUserExistingInGroup){
        return next(new ErrorHandler("User does not exists in group",400));
    }

    const balances = [...group.balances];
    let hasUnsettledBalances = false;

    for (const balanceId of balances) {
        const balance = await UserBalance.findById(balanceId).populate("userFrom", "_id").populate("userTo", "_id");
        const { userFrom, userTo } = balance;
        if (userFrom._id.toString() === userId.toString() || userTo._id.toString() === userId.toString()) {
            hasUnsettledBalances = true;
            break;
        }
    }

    if (hasUnsettledBalances) {
        return next(new ErrorHandler("User has unsettled balances in the group", 400));
    }


    //if user is groupAdmin , delete group
    if(group.createdBy.toString() === userId){
        await group.participants.forEach(catchAsyncErrors(async(participantId)=>{
            const user=await User.findById(participantId);
            const groupList=await user.groupList.filter((grpId)=>grpId.toString() !== groupId.toString());
            user.groupList=groupList;
            await user.save({validateBeforeSave:false});
        }));
    
        await group.deleteOne();
    
        res.status(200).json({
            success:true,
        });
        return;
    }

    //remove user from participants list in group
    const participants=await group.participants.filter((participantId)=>participantId.toString()!==userId.toString());
    group.participants=participants;
    await group.save({validateBeforeSave:false});

    //remove that group from user's groupList
    const groupList=await user.groupList.filter((grpId)=>grpId.toString() !== groupId.toString());
    user.groupList=groupList;
    await user.save({validateBeforeSave:false});
    

    res.status(200).json({
        success:true,
        group,
    })

});




//delete a group
exports.deleteGroup=catchAsyncErrors(async(req,res,next)=>{
    const group= await Group.findById(req.params.groupId);

    if(!group){
        return next(new ErrorHandler("Group invalid",404));
    }

    //only admin can delete group
    if(group.createdBy.toString() !== req.user._id.toString()){
        return next(new ErrorHandler("You are not authorised to delete this group",404));
    }

    await group.participants.forEach(catchAsyncErrors(async(userId)=>{
        const user=await User.findById(userId);
        const groupList=await user.groupList.filter((grpId)=>grpId.toString() !== req.params.groupId.toString());
        user.groupList=groupList;
        await user.save({validateBeforeSave:false});
    }));

    await group.deleteOne();

    res.status(200).json({
        success:true,
    })
});

//get single group details

exports.groupDetail=catchAsyncErrors(async(req,res,next)=>{
    const {groupId}=req.params;
    
    const group= await Group.findById(req.params.groupId).populate({
        path: 'createdBy',
        model: 'User',
        select: 'name',
      })
      .populate({
        path: 'participants',
        model: 'User',
        select: 'name avatar',
      })
      .populate({
        path:'expenses',
        model:'Expense',
        select:'title amount participants'
      });

    if(!group){
        return next(new ErrorHandler("Group not found",404));
    }

    //existing member can only access group details 
    const isUserExistingInGroup=await group.participants.find((u)=>u._id.toString()===req.user._id.toString());
    if(!isUserExistingInGroup){
        return next(new ErrorHandler("You are not authorised to access this group",400));
    }

    res.status(200).json({
        success:true,
        group,
    })

});


//get group expenses
exports.groupExpenses=catchAsyncErrors(async(req,res,next)=>{
    const group=await Group.findById(req.group._id);
    await group.populate('expenses');
    res.status(200).json({
        success:true,
        expenses:group.expenses,
    })
})


//get group members
exports.groupMembers=catchAsyncErrors(async(req,res,next)=>{
    const group=await Group.findById(req.group._id);
    await group.populate('participants','name email groupList');
    res.status(200).json({
        success:true,
        members:group.participants,
    })
})



//update group name
exports.updateGroupName=catchAsyncErrors(async(req,res,next)=>{
    let group=await Group.findById(req.group._id);
    
    group.name=req.body.name;
    await group.save({validateBeforeSave:false});
    res.status(200).json({
        success:true,
        group:req.group,
    })
});

//get all balances of a group
exports.groupBalances=catchAsyncErrors(async(req,res,next)=>{

    const group = await Group.findById(req.group._id);
    let balances=[...group.balances];
    let groupBalance=[];
    for (const balanceId of balances) {
        let balance=await UserBalance.findOne(balanceId);
        if(balance){
            balance=await UserBalance.findOne(balanceId).populate("userFrom", "_id name email").populate("userTo", "_id name email");
            const { userFrom, userTo } = balance;
            const type = balance.balance > 0 ? "lent" : "owe";
            const message = `${userFrom.name} ${type} ${Math.round(Math.abs(balance.balance)*100)/100} to ${userTo.name}`;
            groupBalance.push({
                _id:balanceId,
                userFrom:balance.userFrom,
                userTo:balance.userTo,
                balance: Math.round(balance.balance*100)/100,
                message,
            });
        }
    }

    res.status(200).json({
      success: true,
      groupBalance,
    });
})


exports.settleUp=catchAsyncErrors(async(req,res,next)=>{
    const {balanceId}=req.params;
    const balance=await UserBalance.findById(balanceId);
    const group=await Group.findById(req.group._id);
    group.balances=await group.balances.filter((balance)=>balance.toString()!==balanceId.toString());
    await group.save({validateBeforeSave:false});
    
    await balance.deleteOne();

    res.status(200).json({
        success:true,
    })

})