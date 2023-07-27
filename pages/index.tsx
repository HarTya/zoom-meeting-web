import { EmbeddedClient } from '@zoomus/websdk/embedded'
import { useEffect, useState } from 'react'

export default function Home() {
	const [client, setClient] = useState<null | typeof EmbeddedClient>(null)

	useEffect(() => {
		const initialize = async () => {
			setClient(
				(await import('@zoomus/websdk/embedded')).default.createClient()
			)
		}

		initialize()
	}, [])

	const [meetingNumber, setMeetingNumber] = useState('')
	const [zakToken, setZakToken] = useState('')

	function getSignature(role: 0 | 1) {
		fetch('/api/signature', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				meetingNumber,
				role
			})
		})
			.then(response => response.json())
			.then(({ signature }: { signature: string }) =>
				joinMeeting(signature, role)
			)
	}

	function joinMeeting(signature: string, role: 0 | 1) {
		const isHost = role === 1 && zakToken

		let meetingSDKElement = document.getElementById('meetingSDKElement')

		client?.init({
			zoomAppRoot: meetingSDKElement ? meetingSDKElement : undefined,
			language: 'ru-RU',
			customize: {
				video: {
					viewSizes: {
						default: {
							width: 400,
							height: 400
						}
					}
				},
				chat: {
					popper: {
						placement: 'right'
					}
				}
			}
		})

		const options: {
			sdkKey: string
			signature: string
			meetingNumber: string
			password: string
			userName: string
			zakToken?: string
		} = {
			sdkKey: `${process.env.CLIENT_ID_SDK}`,
			signature,
			meetingNumber,
			password: 'IBDTeam',
			userName: isHost ? 'Доктор' : 'Пациент'
		}

		if (isHost) {
			options.zakToken = zakToken
			setZakToken('')
		}

		client?.join(options)
	}

	async function startMeeting() {
		fetch('/api/meeting', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})
			.then(response => response.json())
			.then(
				({ meetingId, zakToken }: { meetingId: number; zakToken: string }) => {
					if (meetingId && zakToken) {
						setMeetingNumber(String(meetingId))
						setZakToken(zakToken)
					}
				}
			)
	}

	useEffect(() => {
		if (zakToken) getSignature(1)
	}, [zakToken])

	const isMeetingNumberValid = /^\d{3}\d{4}\d{4}$/.test(meetingNumber)

	return (
		<main>
			<section>
				<button
					onClick={() => getSignature(0)}
					disabled={!isMeetingNumberValid}
				>
					Присоединиться
				</button>
				<input
					value={meetingNumber}
					onChange={event => setMeetingNumber(event.target.value)}
					placeholder='Номер конференции'
					onKeyDown={event => {
						if (event.key === 'Enter' && isMeetingNumberValid) getSignature(0)
					}}
				/>
			</section>
			<div id='meetingSDKElement'></div>
			<section>
				<button onClick={() => startMeeting()}>Начать</button>
			</section>
		</main>
	)
}
