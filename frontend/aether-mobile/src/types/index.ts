export interface AuthResponse {
  token: string;
}

export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl: string;
  genre: string;
  featured?: boolean;
}

export interface PlaylistStation {
  id: string;
  stationId: string;
  stationName: string;
  streamUrl: string;
  logoUrl: string;
  genre: string;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: string;
  stations: PlaylistStation[];
}
