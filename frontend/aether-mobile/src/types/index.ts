export interface AuthResponse {
  token: string;
}

export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl: string;
  genre: string;
}
