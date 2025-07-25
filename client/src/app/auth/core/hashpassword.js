import crypto from 'crypto';
export async function hashPassword(password, salt) {
    if (!password || !salt) {
        throw new Error("Password and salt are required for hashing.");
    }
    crypto.scrypt(password.normalize(), salt, 64, (err, derivedKey) => {
        if (err) throw err;
        return derivedKey.toString('hex').normalize();
    });
}


export async function generateSalt() {
    return crypto.randomBytes(16).toString('hex').normalize();
}
 
// What is this salt?
// We are using same hash on all passwords, so if some attacker gets the hash, he can use it to decrypt any password.
// What salt does is that it adds a random string to the password before hashing, making it unique. This means that even if two users have the same password, their hashes will be different

// What is this normalize()?
// normalize() is removes any special characters from the string, making it a standard format. 
