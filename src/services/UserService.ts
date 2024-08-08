import { User } from "../model/user";
import { ErrorsRegister, RegisterInfo } from "../utils/types";

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

    public async checkIfUserExist(nick: string, email: string) {
        try {
            const checkDuplicated = await User.findOne({
                $or: [
                    { nick: nick },
                    { email: email }
                ]
            })
            if (checkDuplicated) return true;
            return false;
        } catch(e) {
            console.error(e);
            return false;
        }
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
}

export default new UserService();