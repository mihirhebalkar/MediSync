//creating api to add doctor in database
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciallity,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    //checking for al data to add doctor

    if (
      name ||
      !email ||
      !password ||
      !speciallity ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }
    //validating email format
    if (!validator.isEmail(email)) {
      res.json({ success: false, message: "Please enter a valid email" });
    }
    //validating password length
    if (password.length < 8) {
      res.json({ success: false, message: "Please enter a strong password" });
    }

    //hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciallity,
      degree,
      about,
      fees,
      address: JSON.parse(address),
      data: Date.now(),
    };

    const newDoctor = await doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for admin login
const loginAdmin = async (req, res) =>{
  try{

    const {email,password} = req.body;
    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
      const token = jwt.sign(email+ password,process.env.JWT_SECRET);
      res.json({success:true,message:"Login Successful",token})
    }else{
      res.json({success:false,message:"Invalid credentials"})
    }
  }catch(error){
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

//api to get all doctor list for admin panel
const allDoctors = async (req, res) =>{
  try{
    const doctors = await doctorModel.find({}).select('-password') //remove password
    res.json({success:true,message:"Doctor List",doctors})
  }catch(error){
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export { addDoctor , loginAdmin,allDoctors};