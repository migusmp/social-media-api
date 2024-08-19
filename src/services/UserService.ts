import { User } from "../model/user";
import bcrypt from 'bcrypt';
import { ErrorsRegister, RegisterInfo, UserPayload } from "../utils/types";
import { createToken } from "../utils/jwt";

class UserService {
    public async verifyRegisterData(name: string, nick: string, email: string, password: string) {
        let errors: ErrorsRegister = {};

        if (name.length < 3 || name.length > 25) {
            errors.name = "inválid name";
        } else if (nick.length < 3 || name.length > 25) {
            errors.nick = "inválid username";
        } else if (!email.includes('@')) {
            errors.email = "inválid email";
        } else if (password.length < 4) {
            errors.password = "password need minuim 4 characters";
        } else {
            return true;
        }

        return errors;
    }

    public async checkIfUserExist(nick: string, email?: string) {
        try {
            const checkDuplicated = await User.findOne({
                $or: [
                    { nick: nick },
                    { email: email }
                ]
            })
            if (checkDuplicated) return checkDuplicated;
            return false;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    public async findUserByNick(nick: string) {
        try {
            const user = await User.findOne({ nick });
            if (!user) {
                return false;
            }
            return user;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    public async hashPassword(password: string) {
        const hashedPwd = await bcrypt.hash(password, 10);
        return hashedPwd;
    }

    public async saveUser(userInfo: RegisterInfo) {
        try {
            const newUser = new User(userInfo);
            await newUser.save();
            return true;
        } catch(e) {
            console.error(e);
            return false;
        }
    }

    public async verifyPassword(pwd: string, userDbPassword: string) {
        const checkPwd = bcrypt.compareSync(pwd, userDbPassword);
        if (checkPwd) {
            return true
        }
        return false;
    }

    public async generateToken(user: UserPayload) {
        return await createToken(user)
    }
}

export default new UserService();