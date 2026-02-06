// src/core/handLabels.ts
import { HandRank, type PlayCard } from './types';

export function getHandLabel(bestHand: {
    rank: HandRank;
    cards: PlayCard[];
}) {
    switch (bestHand.rank) {
        case HandRank.HighCard: {
            const highCard = bestHand.cards
                .map(c => c.rank)
                .sort((a, b) => b - a)[0];

            return `HAUTEUR ${rankToLabel(highCard)}`;
        }

        case HandRank.Pair:
            const rankCounts: Record<number, number> = {};
            bestHand.cards.forEach(c => {
                rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
            });

            const pairRank = Number(
                Object.keys(rankCounts).find(key => rankCounts[Number(key)] === 2)
            );

            return `PAIRE DE ${rankToLabel(pairRank)}`;
        case HandRank.TwoPair:
            return 'DOUBLE PAIRE';
        case HandRank.ThreeOfAKind:
            return 'BRELAN';
        case HandRank.Straight:
            return 'QUINTE';
        case HandRank.Flush:
            return 'COULEUR';
        case HandRank.FullHouse:
            return 'FULL';
        case HandRank.FourOfAKind:
            return 'CARRÉ';
        case HandRank.StraightFlush:
            return 'QUINTE FLUSH';

        default:
            return '';
    }
}

function rankToLabel(rank: number) {
    const map: Record<number, string> = {
        14: 'AS',
        13: 'ROI',
        12: 'DAME',
        11: 'VALET',
        10: '10',
        9: '9',
        8: '8',
        7: '7',
        6: '6',
        5: '5',
        4: '4',
        3: '3',
        2: '2',
    };

    return map[rank];
}
