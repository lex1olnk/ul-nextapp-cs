export class CreateMatchDto {
  id: number;
  type: string;
  status: string;
  bestOf: number;
  gameId: number;
  hasWinner: boolean;
  startedAt: Date;
  finishedAt: Date;
  maxRoundsCount: number;
  serverInstanceId: string;
  cancellationReason: string;
  replayExpirationDate: Date;
  isFinal: boolean;
  tournamentId: string | null;
}
