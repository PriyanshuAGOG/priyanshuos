const DEFAULT_AGENT_ID = 'agent_1401kw6hdp9gfnssm486zamz7f9d';

async function requestToken(agentId, apiKey) {
  const headers = { Accept: 'application/json' };
  if (apiKey) headers['xi-api-key'] = apiKey;

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { method: 'GET', headers },
  );
  const data = await upstream.json().catch(() => ({}));
  return { upstream, data };
}

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

  try {
    // Prefer an authenticated token for a private agent. ElevenLabs secret keys
    // start with `sk_`; a dashboard key ID is not a usable API key.
    if (apiKey && apiKey.startsWith('sk_')) {
      const { upstream, data } = await requestToken(agentId, apiKey);
      if (upstream.ok && data.token) {
        response.status(200).json({ token: data.token });
        return;
      }
      console.error('[voice-token] authenticated token request failed', upstream.status, data?.detail?.code || data?.detail?.status || 'unknown');
    } else if (apiKey) {
      console.warn('[voice-token] ELEVENLABS_API_KEY is a key ID, not an sk_ secret; trying public-agent token flow');
    }

    // Public ElevenLabs agents can mint a WebRTC conversation token without an
    // API key. This preserves the existing live site behaviour while never
    // exposing a secret to the browser. If the agent is later made private,
    // setting a valid sk_ key automatically switches to the authenticated path.
    const { upstream, data } = await requestToken(agentId, null);
    if (upstream.ok && data.token) {
      response.status(200).json({ token: data.token });
      return;
    }

    console.error('[voice-token] public token request failed', upstream.status, data?.detail?.code || data?.detail?.status || 'unknown');
    response.status(502).json({ error: 'Unable to start voice session' });
  } catch (error) {
    console.error('[voice-token] request failed', error);
    response.status(502).json({ error: 'Voice service temporarily unavailable' });
  }
}
