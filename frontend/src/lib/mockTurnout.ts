export interface TurnoutRow {
  constituencyId: string;
  constituencyName: string;
  registered: number;
  voted: number;
}

// TODO(backend): real-time turnout backend থেকে আসবে (registered voters vs cast votes)
export const mockTurnout: TurnoutRow[] = [
  { constituencyId: "dhaka-10", constituencyName: "Dhaka-10", registered: 620400, voted: 112300 },
  { constituencyId: "dhaka-5", constituencyName: "Dhaka-5", registered: 400000, voted: 0 },
];
