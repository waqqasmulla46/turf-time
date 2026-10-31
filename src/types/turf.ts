export interface Player {
  id: number;
  name: string;
  hasPaid: boolean;
}

export interface TurfSession {
  code: string;
  creatorName: string;
  totalMoney: number;
  qrCodeImage: string | null;
  players: Player[];
}
