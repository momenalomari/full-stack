import {ratelimit} from "express-rate-limit";

export const apiLimit = ratelimit({
    windowMs: 15*60*1000,
    limit :5,
    standardHeaders:"draft-7",
    legacyHeaders:false,
   message:{
    message  : "too many request from this api please try again after 15 min"
   }

})

