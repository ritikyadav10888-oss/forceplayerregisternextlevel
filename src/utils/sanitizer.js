export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim();
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};
