import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
// import { use } from 'react';


const generateAccessAndRefreshTokens = async(userId) =>
{
  try{
   const user =  await User.findById(userId);
   const accessToken = user.generateAccessToken();
   const refreshToken = user.generateRefreshToken();

   user.refreshToken = refreshToken;
     await  user.save({validateBeforeSave: false});

     return {accessToken, refreshToken};


  }
  catch(error) {
 
    throw new ApiError(500, "Internal server error");


  }
}



const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation lagana hoga details ki 
  //check if user already exists username ya email se
  //check for images , avatar
  //if available  upload to cloudinary 
  //create user object - create entry in db
  //remove password and refresh token field from response 
  //check for user creation 
  //return response

  const {fullName,email , username,password, role}  = req.body
  console.log(req.files);
  
  console.log("Yeah h naam", fullName);
  console.log("Yeah h email", email);
  console.log("Yeah h password", password);

  if(fullName=="")
  {
    throw new ApiError(400, "Full name chahiye bhai");
  }
  if(email=="")
  {
    throw new ApiError(400, "Email chahiye bhai");
  }
  if(username=="")
  {
    throw new ApiError(400, "Username chahiye bhai");
  }
  if(password=="")
  {
    throw new ApiError(400, "Password chahiye bhai");
  }

  // Validate role if provided
  if(role && !["customer", "admin"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'customer' or 'admin'");
  }

  const existedUser = await  User.findOne({$or: [{username}, {email}]})
  if (existedUser) {
    throw new ApiError(409, "Username ya email already exists");
  }

  // console.log( req.files);

 const avatarLocalPath =  req.files?.avatar[0]?.path;
//  const coverImageLocalPath =  req.files?.coverImage[0]?.path;





 if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar image toh chahiye bhai");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);


  if(!avatar) {
    throw new ApiError(500, "Avatar image upload ni hua");
  }

  const user = await User.create({
    fullName,
    email,
     password,
    username : username.toLowerCase(),
    role: role || "customer", // Default to customer if no role provided
    avatar: avatar.url,
   
  })

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser) {
    throw new ApiError(500, "User creation failed");
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully"))




});

const loginUser = asyncHandler(async (req, res) => {

  //req body se data lelo
  // username se ya email se user ko dhoondo
  //find user
  //agar user nahi mila toh error throw karo
  //agar user mila toh password check karo
  //agar password match nahi hua toh error throw karo
  //agar password match hua toh access and refresh token generate karo and user ko bhejo
  //send cookies with tokens

  const { email ,  username, password } = req.body
  if(!username && !email) {
    throw new ApiError(400, "Username ya email me se ek toh chahiye bhai");
  }

   const user = await User.findOne({$or: [{username}, {email}]})

  if(!user) {
    throw new ApiError(404, "User not found");
  }
 const isPasswordValid =  await user.isPasswordCorrect(password)

 if(!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

      const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
        httpOnly: true,
        secure: true,
        };

        return res.status(200).cookie("accessToken", accessToken, options)
                              .cookie("refreshToken", refreshToken, options)
                              .json(new ApiResponse(200,
                                {
                                  user: loggedInUser,
                                  accessToken,
                                  refreshToken
                                }, "User logged in successfully"
                                ));



  
});

const logoutUser = asyncHandler(async (req, res) => {
    
   await User.findByIdAndUpdate(
      req.user._id,
      {
      $set:{refreshToken: undefined}
      },
       {
        new:true,
       } 
      )

         const options = {
        httpOnly: true,
        secure: true,
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));


});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access, no refresh token provided");
  } 

  try {
    const decodedToken=  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      const user = await User.findById(decodedToken?._id);
  
      if(!user)
      {
        throw new ApiError(401, "Invalid refresh token");
      }
  
    if(user?.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }  
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
  } catch (error) {
    throw new ApiError(401, error?.message|| "Unauthorized access, invalid refresh token");
    
  }

   




});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Current and new passwords are required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
    }

   const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;

  await user.save({validateBeforeSave: true});

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
 
  return res
  .status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body;

  if (!fullName || !email || !username) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
        username,
      }
    },
      {new: true}
    
  ).select("-password")





  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => { 
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

 const avatar = await uploadOnCloudinary(avatarLocalPath)

 if(!avatar.url) {
    throw new ApiError(400, "Avatar image upload failed");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");

   return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));


});





export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar  }; 



