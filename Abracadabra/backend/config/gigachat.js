const config = {
  clientId: process.env.GIGACHAT_CLIENT_ID || '',
  clientSecret: process.env.GIGACHAT_CLIENT_SECRET || '',
  isPersonal: process.env.GIGACHAT_IS_PERSONAL === 'true' || true, // true for personal use, false for business
  isIgnoreTSL: process.env.GIGACHAT_IGNORE_TSL === 'true' || true, // ignore SSL certificates (for development)
  autoRefreshToken: true,
  model: process.env.GIGACHAT_MODEL || 'GigaChat:latest',
  maxTokens: parseInt(process.env.GIGACHAT_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.GIGACHAT_TEMPERATURE) || 0.7,
  timeout: parseInt(process.env.GIGACHAT_TIMEOUT) || 30000,
  
  // Construct the Authorization Key (Client ID:Client Secret in base64)
  get authorizationKey() {
    if (!this.clientId || !this.clientSecret) return '';
    const credentials = `${this.clientId}:${this.clientSecret}`;
    return Buffer.from(credentials).toString('base64');
  }
};

export default config; 