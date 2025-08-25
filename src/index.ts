
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";
import { NowRequest, NowResponse } from '@vercel/node'

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
     await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "User created successfully"
    })

})

app.post("/api/v1/signin", async  (req, res) => {
    const usernaame = req.body.username;
    const password = req.body.password;
    const existingUser = await UserModel.findOne({
        username: usernaame,
        password: password
    })
    if(existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }
})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        //@ts-ignore
        userId: req.userId,
        tags: []
    })
    return res.json({
        message: "Content added"
    })
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId: userId
    }).populate("userId", "username") 
    res.json({
        content
    })
})

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId: req.userId
    }) 
    res.json({
        message: "Deleted"
    })
})

let tokenBlacklist = [];

app.post("/api/v1/logout", userMiddleware, (req, res) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  tokenBlacklist.push(token);  // store token in blacklist

  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

app.post("/api/v1/brain/share", userMiddleware,  async(req, res) => {
    const share = req.body.share;
    if(share) {
        if(share) {
           await LinkModel.create({
                // userId: req.userId,
                hash: random(10)
            })
        } else {
           await LinkModel.deleteOne({
                // userId: req.userId
            });
        }
        res.json({
            message: "Share updated"
        })
    }
})



app.get("api/v1/logout", userMiddleware, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Logout successful. Please remove token from client."
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during logout"
        });
    }
});

app.listen(3000);
