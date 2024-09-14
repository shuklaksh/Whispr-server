import { User } from "@prisma/client";
import { prismaClient } from "../client/db";
import JWT from 'jsonwebtoken'

const JWTSecret = "$uper@123";

class JWTService {
    
    public static async generateTokenForUser(user: User) {
        const payload = {
            id: user?.id,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName
        }

        const token = JWT.sign(payload,JWTSecret);
        return token;
    }
}

export default JWTService;