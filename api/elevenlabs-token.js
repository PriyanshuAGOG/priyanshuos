const DEFAULT_AGENT_ID = 'agent_1401kw6hdp9gfnssm486zamz7f9d';

export default async function handler(request, response) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = request.query.agent_id || process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID;

  if (!apiKey) {
    response.status(500).json({ error: 'Missing ELEVENLABS_API_KEY' });
    return;
  }

  const tokenResponse = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { 'xi-api-key': apiKey } },
  );

  const data = await tokenResponse.json();
  if (!tokenResponse.ok) {
    response.status(tokenResponse.status).json(data);
    return;
  }

  response.status(200).json({ token: data.token });
}
