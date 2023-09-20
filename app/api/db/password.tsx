

// Define the characters that can be used in the password
const PASSWORD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!&#$^<>-"


// A function that generates a random password of a given length
export function generatePassword(length: number) {
    
    // Initialize an empty array to store the password
    var password = new Array(length);

    // Loop through the length of the password
    for (var i = 0; i < length; i++) {
        // Pick a random index from the chars string
        var index = Math.floor(Math.random() * PASSWORD_CHARS.length)
        // Append the character at that index to the password
        password[i] = PASSWORD_CHARS[index]
    }
    // Join the array elements into a string and return the password
    return password.join("")
}