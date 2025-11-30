export interface jwtPayload {
  sub: string; //userId
  email: string;
  iat?: number;
  exp?: number;
}
