import { User } from "@prisma/client";
import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

const JWTSecret = "$uper@123";

class JWTService {
  public static async generateTokenForUser(user: User) {
    const payload: JWTUser = {
      id: user?.id,
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
    };

    const token = JWT.sign(payload, JWTSecret);
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return JWT.verify(token, JWTSecret);
    } catch (err) {
      console.log(err)
      return null;
    }
  }
}

export default JWTService;
