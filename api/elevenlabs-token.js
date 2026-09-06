const DEFAULT_AGENT_ID = 'agent_1401kw6hdp9gfnssm486zamz7f9d';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  response.setHeader('Cache-Control', 'private, no-store, max-age=0');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID;

  if (!apiKey) {
    response.status(500).json({ error: 'Voice service is not configured' });
    return;
  }

  try {
    const tokenResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          Accept: 'application/json',
        },
      },
    );

    const data = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok || !data.token) {
      console.error('[voice-token] ElevenLabs token mint failed', tokenResponse.status);
      response.status(tokenResponse.ok ? 502 : tokenResponse.status).json({ error: 'Unable to start voice session' });
      return;
    }

    response.status(200).json({ token: data.token });
  } catch (error) {
    console.error('[voice-token] request failed', error);
    response.status(502).json({ error: 'Voice service temporarily unavailable' });
  }
}
