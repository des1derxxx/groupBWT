export interface jwtPayload {
  sub: string; //userId
  iat?: number;
  exp?: number;
}
