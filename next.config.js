/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		CLIENT_ID_OAUTH: process.env.CLIENT_ID_OAUTH,
		CLIENT_SECRET_OAUTH: process.env.CLIENT_SECRET_OAUTH,
		CLIENT_ID_SDK: process.env.CLIENT_ID_SDK,
		CLIENT_SECRET_SDK: process.env.CLIENT_SECRET_SDK,
		FIRST_REFRESH_TOKEN: process.env.FIRST_REFRESH_TOKEN
	}
}

module.exports = nextConfig
