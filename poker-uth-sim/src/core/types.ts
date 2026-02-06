export type Suit = 'H' | 'D' | 'C' | 'S';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 14 = As

export interface PlayCard {
    rank: Rank;
    suit: Suit;
}

export enum HandRank {
    HighCard = 0,
    Pair,
    TwoPair,
    ThreeOfAKind,
    Straight,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush,
    RoyalFlush
}

export type HandRecord = {
    result: 'WIN' | 'LOSS' | 'FOLD';
    amount: number;
    playerHandLabel: string;
    croupierHandLabel: string;
};