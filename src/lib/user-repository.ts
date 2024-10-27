import { db } from "./db"

interface User {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    githubToken: string | null;
}

export const UserRepository = {
    async createUser(user: Omit<User, "id">): Promise<User> {
        const createdUser = await db
            .insertInto('users')
            .values(user)
            .returningAll()
            .executeTakeFirstOrThrow();
        return createdUser;
    },

    async getUserById(id: string): Promise<User | undefined> {
        return db("users").where({ id }).first();
    },

    async updateUserToken(id: string, githubToken: string): Promise<void> {
        await db("users").where({ id }).update({ githubToken });
    },
};
