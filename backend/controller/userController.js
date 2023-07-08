const ErrorHandler=require("../utils/errorHandler");
const catchAsyncErrors=require("../middleware/catchAsyncError");
const User=require("../models/userModel");
const Group=require("../models/groupModel");
const sendToken=require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");


//register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    const {name,email,password}=req.body;
    const user =await User.create({
        name,email,password,
        avatar:{
            public_id:"sample public id",
            url:"profile pic url"
        }
    });


    sendToken(user,201,res);
});

//login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    //checking if user has given email and password both
    if(!email || !password){
        return next(new ErrorHandler("Please enter email and password",400));
    }
    
    const user=await User.findOne({ email:email }).select("+password");
    
    if(!user){
        return next(new ErrorHandler("Invalid email or password"),401);
    }

    const isPasswordMatched=await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password"),401);
    }

    sendToken(user,200,res);

});

//logout user
exports.logoutUser=catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    });
    res.status(200).json({
        success:true,
        message:"Logged out"
    })
});

//forgot password
exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    //get reset password token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    //eg : http://localhost/api/v1.....

    const message=`Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it `;

    try{
        await sendEmail({
            email:user.email,
            subject:`Expense_SPLIT Password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })
    }catch(error){
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    }

})

//reset password
exports.resetPassword=catchAsyncErrors(async(req,res,next)=>{

    //creating token hash
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");

    //finding user with this hash token (we created this while creating getResetPasswordToken in userModels)
    const user=await User.findOne({
        resetPasswordToken:resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match confirm password",400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;


    await user.save();

    sendToken(user,200,res);
})


//get all users
exports.getAllUsers=catchAsyncErrors(async(req,res)=>{
    const users=await User.find();
    res.status(200).json({
        success:true,
        users,
    })
});


//geat user details

exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user,
    });
});


//update user password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
    const user=await User.findById(req.user.id).select("+password");


    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect"),400);
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match with confirm password"),400);
    }

    user.password=req.body.newPassword;
    await user.save();

    sendToken(user,200,res);
    
});


//update user profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
    });    
});


//get all groups in which current user is present
exports.myGroups=catchAsyncErrors(async(req,res,next)=>{
    const userId=req.user._id;

    const user=await User.findById(userId);

    if(!user){
        return next(new ErrorHandler("User does not exist",400));
    }

    res.status(200).json({
        success:true,
        groups:user.groupList,
    })
    
});

//get all balances of a user
exports.myBalances = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    let balances = [];
  
    for (const groupId of user.groupList) {
      const group = await Group.findById(groupId);
      const groupBalances = group.balances;
  
      for (const balance of groupBalances) {
        if (balance.userFrom.toString() === userId.toString()) {
          let user2 = balances.find((obj) => obj.user.toString() === balance.userTo.toString());
          if (!user2) {
            user2 = { user: balance.userTo, amount: balance.balance };
            balances.push(user2);
          } else {
            user2.amount += balance.balance;
          }
        } else if (balance.userTo.toString() === userId.toString()) {
          let user2 = balances.find((obj) => obj.user.toString() === balance.userFrom.toString());
          if (!user2) {
            user2 = { user: balance.userFrom, amount: -balance.balance };
            balances.push(user2);
          } else {
            user2.amount -= balance.balance;
          }
        }
      }
    }

    for (const balance of balances) {
        const user = await User.findById(balance.user);
        balance.user = {
          _id: user._id,
          name: user.name,
          email: user.email,
        };
        const type=(balance.amount>0)?"lent":"owe";
        balance.message=`You ${type} ${Math.abs(balance.amount)} to ${user.name}`
    }

    balances = balances.filter((balance) => balance.amount !== 0);
  
    res.status(200).json({
      success: true,
      balances,
    });
  });