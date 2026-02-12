import express from "express";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const Router=express.Router();

