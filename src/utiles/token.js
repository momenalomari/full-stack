import jst from "jsonwebtoken";

export const genrateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            type :"access"
        },
        process.env.ACCESS_JWT_SECRET,
        { expiresIn: "15m" ,
            issuer:"my-api",
            audience:"my-client"
        }
    );
};

export const genrateRefreshToken = (user)=>{

    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            type: "refresh"
        },
        process.env.REFRESH_JWT_SECRET,
        { expiresIn: "7d",
            issuer: "my-api",
            audience: "my-client"
        }
    );
}