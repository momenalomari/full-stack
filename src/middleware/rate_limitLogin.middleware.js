import {rateLimit} from "express-rate-limit";

export const rateLimitLogin = rateLimit({
    windowMs: 15*60*1000,
    limit :5,
    standardHeaders:"draft-7",
    legacyHeaders:false,
    handler:(req,res)=>{
        return res.status(429).json({
            message:"Too many requests from this IP, please try again after 15 minutes",
            error:"Too Many Requests",
            SUCCESS:false
        })
    }
})