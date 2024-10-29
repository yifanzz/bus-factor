import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const repoName = searchParams.get('repo')
        const busFactor = parseInt(searchParams.get('factor') || '0')

        // Helper function to determine background color
        function getBusFactorColor(factor: number) {
            if (factor === 1) return '#ef4444' // red-500
            if (factor >= 2 && factor <= 3) return '#f59e0b' // amber-500
            return '#22c55e' // green-500
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        padding: '40px 80px',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        fontSize: 60,
                        fontWeight: 'bold',
                        marginBottom: 40,
                        color: '#18181b',
                    }}>
                        {repoName}
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                    }}>
                        <div style={{
                            fontSize: 32,
                            color: '#71717a',
                        }}>
                            Bus Factor
                        </div>
                        <div style={{
                            fontSize: 120,
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: getBusFactorColor(busFactor),
                            padding: '20px 60px',
                            borderRadius: '16px',
                        }}>
                            {busFactor}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        )
    } catch (e) {
        return new Response(`Failed to generate image`, {
            status: 500,
        })
    }
} 