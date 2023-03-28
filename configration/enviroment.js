

const development = {
    name: 'development',
    asset_path: 'assets',
    session_cookie: 'secretKey',
    db: 'My-book_Social-meadia',
    smtp:{
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'smartds2550',
            pass: '2222'
        }
    },
    githubClientID: '72d0b0fe94cefd8c97f5',
    githubClientSecret:' 9f0e169138e9fdadcbb765db451d8a4ae464b759',
    gitubCallbackURL: "http://localhost:2000/user/auth/github/callback",
    jwt_Secret: 'My-Book',
}


const production = {
    name: 'production',

}

module.exports = development;