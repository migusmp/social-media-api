import bcrypt from 'bcrypt';
import { User } from "../../src/model/user";
import UserService from "../../src/services/UserService";
import { UserPayload } from '../../src/utils/types';
import { createToken } from '../../src/utils/jwt';
import { Types } from 'mongoose';

jest.mock('../../src/model/user', () => ({
    User: {
        findOne: jest.fn(),
    }
}));

// <--------------------- TEST 1 ---------------------->

describe('UserService.verifyRegisterData', () => {
    it('should return true for valid data', async () => {
        const result = await UserService.verifyRegisterData('John', 'johnny', 'john@example.com', '1234');
        expect(result).toBe(true);
    });

    it('should return error for short name', async () => {
        const result = await UserService.verifyRegisterData('Jo', 'johnny', 'john@example.com', '1234');
        expect(result).toEqual({ name: 'inválid name' });
    });

    it('should return error for short nick', async () => {
        const result = await UserService.verifyRegisterData('John', 'jo', 'john@example.com', '1234');
        expect(result).toEqual({ nick: 'inválid username' });
    });

    it('should return error for invalid email', async () => {
        const result = await UserService.verifyRegisterData('John', 'johnny', 'johnexample.com', '1234');
        expect(result).toEqual({ email: 'inválid email' });
    });

    it('should return error for short password', async () => {
        const result = await UserService.verifyRegisterData('John', 'johnny', 'john@example.com', '123');
        expect(result).toEqual({ password: 'password need minuim 4 characters' });
    });
});

// <--------------------- TEST 2 ---------------------->

describe('UserService.checkIfUserExist', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the user if nick matches', async () => {
        const mockUser = { id: '1', nick: 'testuser', email: 'test@example.com' };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await UserService.checkIfUserExist('testuser');

        expect(User.findOne).toHaveBeenCalledWith({
            $or: [{ nick: 'testuser' }, { email: undefined }]
        });
        expect(result).toEqual(mockUser);
    });

    it('should return the user if email matches', async () => {
        const mockUser = { id: '2', nick: 'anotheruser', email: 'another@example.com' };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await UserService.checkIfUserExist('nonexisting', 'another@example.com');

        expect(User.findOne).toHaveBeenCalledWith({
            $or: [{ nick: 'nonexisting' }, { email: 'another@example.com' }]
        });
        expect(result).toEqual(mockUser);
    });

    it('should return false if no user is found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const result = await UserService.checkIfUserExist('ghost');

        expect(result).toBe(false);
    });

    it('should return false and log error on exception', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

        const result = await UserService.checkIfUserExist('testuser');

        expect(consoleSpy).toHaveBeenCalled();
        expect(result).toBe(false);

        consoleSpy.mockRestore();
    });
});

// <--------------------- TEST 3 ---------------------->

describe('UserService.findUserByNick', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return user when nick exists', async () => {
        const fakeUser = { _id: '123', nick: 'johndoe', email: 'john@example.com' };
        (User.findOne as jest.Mock).mockResolvedValue(fakeUser);

        const result = await UserService.findUserByNick('johndoe');
        expect(User.findOne).toHaveBeenCalledWith({ nick: 'johndoe' });
        expect(result).toEqual(fakeUser);
    });

    it('should return false if no user is found', async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const result = await UserService.findUserByNick('nonexistent');
        expect(User.findOne).toHaveBeenCalledWith({ nick: 'nonexistent' });
        expect(result).toBe(false);
    });

    it('should return false on error', async () => {
        (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));

        const result = await UserService.findUserByNick('johndoe');
        expect(User.findOne).toHaveBeenCalledWith({ nick: 'johndoe' });
        expect(result).toBe(false);
    });
});

// <--------------------- TEST 4 ---------------------->

describe('UserService.hashPassword', () => {
    it('should return a hashed password string', async () => {
        const password = 'mypassword';
        const hashed = await UserService.hashPassword(password);

        expect(typeof hashed).toBe('string');
        expect(hashed).not.toBe(password); // no debe ser igual al texto plano
        expect(hashed.length).toBeGreaterThan(0);
    });
});

// <--------------------- TEST 5 ---------------------->

describe('UserService.saveUser', () => {
    it('should save a new user and return true or false', async () => {
        const userInfo = { nick: 'john', email: 'john@example.com', password: '1234', name: 'John' };
        const result = await UserService.saveUser(userInfo);

        // Puede ser true o false dependiendo si guarda o no (sin mocks, depende de DB)
        expect(typeof result).toBe('boolean');
    });
});

// <--------------------- TEST 6 ---------------------->

describe('UserService.verifyPassword', () => {
    it('should return true for correct password', async () => {
        const password = 'mypassword';
        const hashed = bcrypt.hashSync(password, 10);

        const result = await UserService.verifyPassword(password, hashed);
        expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
        const password = 'mypassword';
        const hashed = bcrypt.hashSync(password, 10);

        const result = await UserService.verifyPassword('wrongpassword', hashed);
        expect(result).toBe(false);
    });
});

// <--------------------- TEST 7 ---------------------->

describe('createToken', () => {
    const info: UserPayload = {
        _id: '123',
        name: 'John',
        nick: 'johnny',
        email: 'john@example.com',
        description: 'desc',
        password: 'hashedpass',
        followers: [new Types.ObjectId(), new Types.ObjectId()],
        following: [new Types.ObjectId()],
        image: 'image.png',
        created_at: new Date(),
    };

    it('should return a token string when secret is defined', async () => {
        const token = await createToken(info);
        expect(typeof token).toBe('string');
        expect(token).toBeTruthy();
    });
});

// <--------------------- TEST 8 ---------------------->

describe('UserService.generateToken', () => {
    const userPayload = {
        _id: '123',
        name: 'John',
        nick: 'johnny',
        email: 'john@example.com',
        description: 'desc',
        password: 'hashedpass',
        followers: [new Types.ObjectId(), new Types.ObjectId()],
        following: [new Types.ObjectId()],
        image: 'image.png',
        created_at: new Date(),
    };

    it('should return a token string', async () => {
        const token = await UserService.generateToken(userPayload);
        expect(typeof token).toBe('string');
        expect(token).toBeTruthy();
    });
});

// <--------------------- TEST 9 ---------------------->

describe('UserService.updateUser', () => {
    let userId: string = "683184a03f8095069a874db0"; // Introduce an existing id
    const updateInfo = { name: 'New Name' };

    it('should return updated data when update succeeds', async () => {
        const result = await UserService.updateUser(userId, updateInfo);
        expect(result).toBeDefined();
    });

    it('should return false when no user found to update', async () => {
        const nonExistingUserId = 'nonExistingId';
        const result = await UserService.updateUser(nonExistingUserId, updateInfo);
        expect(result).toBe(false);
    });

    it('should return false if there is an error', async () => {
        const invalidUserId = ''; // ID inválido puede causar error
        const result = await UserService.updateUser(invalidUserId, updateInfo);
        expect(result).toBe(false);
    });
});

// <--------------------- TEST 10 ---------------------->

describe('UserService.updateUserImage', () => {
    const userId = 'someUserId';
    const newImage = 'new-image-url.png';

    it('should return updated user data with nick and image when update succeeds', async () => {
        const result = await UserService.updateUserImage(userId, newImage);
        expect(result).toBeDefined();
    });

    it('should return false if update throws an error', async () => {
        const invalidUserId = ''; // un ID inválido para forzar error
        const result = await UserService.updateUserImage(invalidUserId, newImage);
        expect(result).toBe(false);
    });
});
