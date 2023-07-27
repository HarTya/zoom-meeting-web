import { KJUR } from 'jsrsasign'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
	signature: string
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method === 'POST') {
		const iat = Math.round(new Date().getTime() / 1000) - 30
		const exp = iat + 60 * 60 * 2

		const Header = { alg: 'HS256', typ: 'JWT' }

		const Payload = {
			sdkKey: process.env.CLIENT_ID_SDK,
			mn: req.body.meetingNumber,
			role: req.body.role,
			iat: iat,
			exp: exp,
			appKey: process.env.CLIENT_ID_SDK,
			tokenExp: iat + 60 * 60 * 2
		}

		const sHeader = JSON.stringify(Header)
		const sPayload = JSON.stringify(Payload)

		const signature = KJUR.jws.JWS.sign(
			'HS256',
			sHeader,
			sPayload,
			process.env.CLIENT_SECRET_SDK
		)

		res.json({
			signature
		})
	} else {
		res.status(405).end()
	}
}
