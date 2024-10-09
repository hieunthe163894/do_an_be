import {
  AccountRepository,
  AuthenticateRepository,
} from "../repository/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendConfirmEmail } from "../utils/mailTransport.js";
import jwksClient from "jwks-rsa";
import emailTemplate from "../utils/emailTemplate.js";
import { io } from "../index.js";
import { ROLE_NAME } from "../utils/const.js";
import { StudentRepository } from "../repository/index.js";
const client = jwksClient({
  jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
  requestHeaders: {
    "user-agent": "some-user-agent",
  },
  timeout: 30000,
});

const getKey = async (header, callback) => {
  try {
    const key = await client.getSigningKey(header.kid);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  } catch (error) {
    callback(error);
  }
};
const authenticate = async (req, res) => {
  try {
    const result = await AuthenticateRepository.authenticate();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (
      firstName.length == 0 ||
      lastName.length == 0 ||
      email.length == 0 ||
      password.length == 0
    ) {
      return res
        .status(400)
        .json({ error: "Please fill out all the mandatory field" });
    }
    if (confirmPassword !== password) {
      return res
        .status(400)
        .json({ error: "Password does not match confirm password" });
    }
    const existingUser = await AuthenticateRepository.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is taken" });
    }
    const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUND));
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = await AuthenticateRepository.addUser({
      firstName,
      lastName,
      email,
      hashedPassword,
    });
    await sendConfirmEmail(email, newUser._id);
    return res.status(201).json({
      message:
        "Sign up successfully, go to your email to confirm signing up. The email will expire in an hour",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const token = req.params.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { userId } = decodedToken;
    const result = await AuthenticateRepository.verifyUser(userId);
    return res
      .status(200)
      .json({ data: "The user was successfully verified!! Now redirecting" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Verify token expired, go to sign in page to send new email",
      });
    }

    return res.status(500).json({ error: error.message });
  }
};
const login = async (req, res) => {
  try {
    const role = req.body.role;
    const existingAccount = await AccountRepository.findAccountByEmail(
      req.body.email
    );
    if (!existingAccount) {
      return res.status(400).json({ error: "Email not found" });
    }
    const passwordMatch = bcrypt.compareSync(
      req.body.password,
      existingAccount.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ error: "Bad Credential" });
    }
    let userDetail = {};
    switch (role) {
      case ROLE_NAME.student:
        const student = await StudentRepository.findStudentByAccountId(
          existingAccount._id
        );  
        if (!student) {
          return res
            .status(404)
            .json({
              error: "No such student found matched with provided credential",
            });
        }
        userDetail = student;
        userDetail.role = ROLE_NAME.student;
        break;
      case ROLE_NAME.teacher:
        return res.status(404).json({ error: "Unimplemented" });
      case ROLE_NAME.startUpDepartment:
        return res.status(404).json({ error: "Unimplemented" });
      case ROLE_NAME.admin:
        return res.status(404).json({ error: "Unimplemented" });
      default:
        return res.status(500).json({ error: "Bad request" });
    }
    // if (!existingAccount.verify) {
    //   return res.status(400).json({ error: "The account is not verified!" });
    // }
    const socket = io.sockets.sockets.get(req.body.socketId);
    if (socket) {
      socket.accountId = existingAccount._id.toString();
    } else {
      console.log("No socket");
    }
    // io.sockets.sockets.forEach((sk) => {
    //   console.log(`socket ${sk.id} account ${sk?.accountId}`);
    // });
    const payload = {
      account: existingAccount._id,
      role: {
        id: userDetail._id,
        role: userDetail.role,
      },
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1w",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    return res
      .status(200)
      .json({ message: "Login successfully! Welcome back", data: userDetail });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const mobileLogin = async (req, res) => {
  try {
    const existingUser = await AuthenticateRepository.getUserByEmail(
      req.body.email
    );
    if (!existingUser) {
      return res.status(400).json({ error: "Email not found" });
    }
    const passwordMatch = bcrypt.compareSync(
      req.body.password,
      existingUser.password
    );
    if (!passwordMatch) {
      return res.status(400).json({ error: "Bad Credential" });
    }
    if (!existingUser.verify) {
      return res.status(400).json({ error: "The account is not verified!" });
    }
    const payload = {
      userId: existingUser._id,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1w",
    });
    const { createdAt, updatedAt, password, ...filteredUser } =
      existingUser._doc;
    res.setHeader("accessToken", accessToken);
    res.setHeader("refreshToken", refreshToken);
    return res.status(200).json({
      message: "Login successfully! Welcome back",
      data: filteredUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const decodedToken = req.decodedToken;
    const user = await AuthenticateRepository.getUserById(decodedToken.userId);
    const { password, createdAt, updatedAt, ...filterdUser } = user._doc;
    return res.status(200).json({ data: filterdUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ error: "No cookie for refreshToken was provided" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const existingUser = await AuthenticateRepository.getUserById(
      decodedToken.userId
    );
    const { createdAt, updatedAt, password, ...filteredUser } =
      existingUser._doc;
    const payload = {
      userId: existingUser._id,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    return res.status(200).json({
      message: "accessToken has been succesfully refreshed!",
      data: filteredUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const logOut = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");
    return res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const oauth2GoogleAuthentication = async (req, res) => {
  try {
    const oauth2Result = await req.user;
    if (oauth2Result && oauth2Result.error) {
      return res.status(400).json({ error: oauth2Result.error });
    }
    const accessToken = jwt.sign(
      { userId: oauth2Result._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1hr",
      }
    );
    const refreshToken = jwt.sign(
      { userId: oauth2Result._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1w",
      }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    return res.redirect("http://localhost:3000/oauth2Redirect");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const googleLogin = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res
        .status(400)
        .json({ error: "No Token was provided, please try again" });
    }
    jwt.verify(
      token,
      getKey,
      { algorithms: ["RS256"] },
      async (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ error: "Invalid token" });
        }

        try {
          const existingUser = await AuthenticateRepository.getUserByEmail(
            decodedToken.email
          );
          if (!existingUser) {
            return res.status(400).json({ error: "Email not found" });
          }
          const accessToken = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1hr",
            }
          );

          const refreshToken = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1w",
            }
          );

          const { createdAt, updatedAt, password, ...filteredUser } =
            existingUser._doc;

          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            path: "/",
            expires: new Date(Date.now() + 60 * 60 * 1000),
            sameSite: "lax",
            secure: false,
          });

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            sameSite: "lax",
            secure: false,
          });

          return res.status(200).json({
            message: "Login successfully! Welcome back",
            data: filteredUser,
          });
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const sendResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await AuthenticateRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    await emailTemplate.sendNewPasswordEmail(user.email, newPassword);
    return res.status(200).json({
      message: "New password sent successfully! Please check your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const generateRandomPassword = () => {
  const length = 10;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let newPassword = "";
  for (let i = 0; i < length; i++) {
    newPassword += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return newPassword;
};

const getArtistInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const existingUser = await AuthenticateRepository.getUserById(userId);
    if (!existingUser) {
      return res.status(400).json({ error: error });
    }
    const payload = {
      userId: existingUser._id,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1w",
    });
    const { createdAt, updatedAt, password, ...filterdUser } =
      existingUser._doc;
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
      secure: false,
    });
    return res.status(200).json({ data: filterdUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
export default {
  authenticate,
  signUp,
  verifyUser,
  login,
  getUserInfo,
  refreshToken,
  logOut,
  oauth2GoogleAuthentication,
  googleLogin,
  sendResetLink,
  mobileLogin,
  getArtistInfo,
};
