import { User } from '../models/user.js';
export const seedUsers = async () => {
    await User.bulkCreate([
        { username: 'JollyGuru', password: 'password', role: 'user' },
        { username: 'SunnyScribe', password: 'password', role: 'user' },
        { username: 'RadiantComet', password: 'password', role: 'user' },
    ], { individualHooks: true });
};
export const userData = [
    { username: 'JollyGuru', password: 'password', role: 'user' },
    { username: 'SunnyScribe', password: 'password', role: 'user' },
    { username: 'RadiantComet', password: 'password', role: 'user' }
];
