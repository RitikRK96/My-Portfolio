const admin = require('firebase-admin');

// Middleware to validate Firebase ID Token
const validateFirebaseIdToken = async (req, res, next) => {
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        return res.status(403).json({ error: 'Unauthorized', message: 'No token provided' });
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        idToken = req.cookies.__session;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;

        // Check if user is admin (You can use custom claims or just check email)
        // For now, assuming any authenticated user in this context is admin 
        // since we disabled public signup. 
        // To be stricter: if (decodedIdToken.admin !== true && decodedIdToken.email !== 'your-admin@email.com') return res.status(403).send('Unauthorized');

        next();
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        return res.status(403).json({ error: 'Unauthorized', message: 'Invalid token' });
    }
};

module.exports = validateFirebaseIdToken;
