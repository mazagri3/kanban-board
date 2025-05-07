import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
export class User extends Model {
    // Hash the password before saving the user
    async setPassword(password) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(password, saltRounds);
    }
    // Check if account is locked
    isLocked() {
        if (!this.lockedUntil)
            return false;
        return new Date() < this.lockedUntil;
    }
    // Increment login attempts and lock account if necessary
    async incrementLoginAttempts() {
        this.loginAttempts += 1;
        if (this.loginAttempts >= 5) {
            this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }
        await this.save();
    }
    // Reset login attempts
    async resetLoginAttempts() {
        this.loginAttempts = 0;
        this.lockedUntil = null;
        this.lastLogin = new Date();
        await this.save();
    }
}
export function UserFactory(sequelize) {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 30]
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100]
            }
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user'
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        loginAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lockedUntil: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'users',
        sequelize,
        hooks: {
            beforeCreate: async (user) => {
                await user.setPassword(user.password);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    await user.setPassword(user.password);
                }
            }
        }
    });
    return User;
}
