import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const KEY = 'kantrack.mobile.tokens.v1';

interface Tokens { accessToken: string; refreshToken: string; expiresAt: number }
export interface OidcConfig { issuer: string; clientId: string; redirectUri: string }

/** Solo se compone cuando KT-012-02 registre cliente y dispositivo móvil. */
export class MobileAuth {
  private refreshing: Promise<string> | null = null;

  constructor(private readonly config: OidcConfig) {
    if (new URL(config.issuer).protocol !== 'https:' || !config.clientId || !config.redirectUri.startsWith('kantrack-driver://')) {
      throw new Error('Configuración OIDC móvil incompleta.');
    }
  }

  async authorize(): Promise<boolean> {
    const discovery = await AuthSession.fetchDiscoveryAsync(this.config.issuer);
    const request = new AuthSession.AuthRequest({
      clientId: this.config.clientId,
      redirectUri: this.config.redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'offline_access'],
      usePKCE: true
    });
    const result = await request.promptAsync(discovery);
    if (result.type !== 'success' || !result.params.code || !request.codeVerifier) return false;
    const token = await AuthSession.exchangeCodeAsync({
      clientId: this.config.clientId,
      code: result.params.code,
      redirectUri: this.config.redirectUri,
      extraParams: { code_verifier: request.codeVerifier }
    }, discovery);
    if (!token.refreshToken || !token.expiresIn) throw new Error('Token móvil sin refresh rotativo o expiración.');
    await this.save({ accessToken: token.accessToken, refreshToken: token.refreshToken, expiresAt: Date.now() + token.expiresIn * 1000 });
    return true;
  }

  async accessToken(): Promise<string | null> {
    const token = await this.load();
    if (!token) return null;
    if (token.expiresAt > Date.now() + 30_000) return token.accessToken;
    if (!this.refreshing) this.refreshing = this.rotate(token).finally(() => { this.refreshing = null; });
    return this.refreshing;
  }

  async clear(): Promise<void> { await SecureStore.deleteItemAsync(KEY); }

  private async rotate(previous: Tokens): Promise<string> {
    try {
      const discovery = await AuthSession.fetchDiscoveryAsync(this.config.issuer);
      const token = await AuthSession.refreshAsync({ clientId: this.config.clientId, refreshToken: previous.refreshToken }, discovery);
      if (!token.refreshToken || !token.expiresIn) throw new Error('No se rotó el refresh token.');
      await this.save({ accessToken: token.accessToken, refreshToken: token.refreshToken, expiresAt: Date.now() + token.expiresIn * 1000 });
      return token.accessToken;
    } catch {
      await this.clear();
      throw new Error('La sesión móvil expiró.');
    }
  }

  private async load(): Promise<Tokens | null> {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    try {
      const token = JSON.parse(raw) as Tokens;
      if (typeof token.accessToken !== 'string' || typeof token.refreshToken !== 'string' || !Number.isFinite(token.expiresAt)) throw new Error('Invalid token');
      return token;
    } catch {
      await this.clear();
      return null;
    }
  }

  private async save(token: Tokens): Promise<void> { await SecureStore.setItemAsync(KEY, JSON.stringify(token)); }
}
