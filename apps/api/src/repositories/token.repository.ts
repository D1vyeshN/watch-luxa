import { Token, IToken } from '@models/token.model';

export class TokenRepository {
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<IToken> {
    return Token.create(data);
  }

  async findByHash(tokenHash: string): Promise<IToken | null> {
    return Token.findOne({ tokenHash });
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    await Token.deleteOne({ tokenHash });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await Token.deleteMany({ userId });
  }
}

export const tokenRepository = new TokenRepository();