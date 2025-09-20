import {PxUser} from "./px-user";

export class PxAuthResponse {
    user: (PxUser | null) = null;
    accessToken = '';
    refreshToken = '';
    accessTokenExpiresAt = '';
    refreshTokenExpiresAt = '';
}
