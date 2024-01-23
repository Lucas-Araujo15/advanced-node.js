import { type FacebookAuthentication } from '@/domain/features'
import { type LoadFacebookUserApi } from '@/data/contracts/apis'
import { AuthenticationError } from '@/domain/errors'
import { type SaveFacebookAccountRepository, type LoadUserAccountRepository } from '../contracts/repos'
import { AccessToken, FacebookAccount } from '@/domain/models'
import { type TokenGenerator } from '../contracts/crypto'

export class FacebookAuthenticationService {
  constructor (
    private readonly facebookApi: LoadFacebookUserApi,
    // Intersection Types
    private readonly userAccountRepo: LoadUserAccountRepository & SaveFacebookAccountRepository,

    private readonly crypto: TokenGenerator
  ) {}

  async perform (params: FacebookAuthentication.Params): Promise<FacebookAuthentication.Result> {
    const fbData = await this.facebookApi.loadUser(params)

    if (fbData !== undefined) {
      const accountData = await this.userAccountRepo.load({ email: fbData.email })
      const fbAccount = new FacebookAccount(fbData, accountData)
      const { id } = await this.userAccountRepo.saveWithFacebook(fbAccount)
      const token = await this.crypto.generateToken({ key: id, expirationInMs: AccessToken.expirationInMs })
      return new AccessToken(token)
    }

    return new AuthenticationError()
  }
}
