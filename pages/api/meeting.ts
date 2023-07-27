import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
	meetingId: number
	zakToken: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method === 'GET') {
		const Base64Encoded = btoa(
			`${process.env.CLIENT_ID_OAUTH}:${process.env.CLIENT_SECRET_OAUTH}`
		)

		const getRefreshToken = () => {
			try {
				return fs.readFileSync('/tmp/refreshToken.txt', 'utf8')
			} catch {
				return `${process.env.FIRST_REFRESH_TOKEN}`
			}
		}

		const { access_token: accessToken, refresh_token: newRefreshToken } =
			await fetch(
				`https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${getRefreshToken()}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: `Basic ${Base64Encoded}`
					}
				}
			).then(response => response.json())

		fs.writeFileSync('/tmp/refreshToken.txt', newRefreshToken)

		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`
		}

		const { id } = await fetch('https://api.zoom.us/v2/users/me/meetings', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				topic: 'Консультация',
				duration: 60,
				password: 'IBDTeam',
				settings: {
					join_before_host: true,
					waiting_room: false
				}
			})
		}).then(response => response.json())

		const { token } = await fetch(
			'https://api.zoom.us/v2/users/me/token?type=zak',
			{
				method: 'GET',
				headers
			}
		).then(response => response.json())

		res.json({
			meetingId: id,
			zakToken: token
		})
	} else {
		res.status(405).end()
	}
}
