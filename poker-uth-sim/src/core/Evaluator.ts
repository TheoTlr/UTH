import {type PlayCard, HandRank} from './types';


export class HandEvaluator {

    // Analyse une main de 5 cartes
    static evaluate(cards: PlayCard[]): { rank: HandRank, value: number } {
        const ranks = cards.map(c => c.rank).sort((a, b) => b - a);
        const suits = cards.map(c => c.suit);

        // 1. Comptage des occurrences (ex: { '14': 2, '10': 3 } pour un Full d'As par les 10)
        const counts: { [key: number]: number } = {};
        ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
        const occurrences = Object.values(counts).sort((a, b) => b - a);
        const uniqueRanks = Object.keys(counts).map(Number).sort((a, b) => {
            // Trie par nombre d'occurrences d'abord, puis par rang
            if (counts[b] !== counts[a]) return counts[b] - counts[a];
            return b - a;
        });

        // 2. Vérification Flush et Straight
        const isFlush = new Set(suits).size === 1;
        const isStraight = this.checkStraight(uniqueRanks);

        // 3. Détermination de la catégorie
        let category = HandRank.HighCard;
        if (isFlush && isStraight) category = HandRank.StraightFlush;
        else if (occurrences[0] === 4) category = HandRank.FourOfAKind;
        else if (occurrences[0] === 3 && occurrences[1] === 2) category = HandRank.FullHouse;
        else if (isFlush) category = HandRank.Flush;
        else if (isStraight) category = HandRank.Straight;
        else if (occurrences[0] === 3) category = HandRank.ThreeOfAKind;
        else if (occurrences[0] === 2 && occurrences[1] === 2) category = HandRank.TwoPair;
        else if (occurrences[0] === 2) category = HandRank.Pair;

        // 4. Calcul du score de départage (Base 15)
        // On donne un poids énorme à la catégorie, puis on ajoute les rangs triés
        const score = category * Math.pow(15, 5) +
            uniqueRanks.reduce((acc, val, i) => acc + val * Math.pow(15, 4 - i), 0);

        return { rank: category, value: score };
    }

    private static checkStraight(ranks: number[]): boolean {
        if (ranks.length < 5) return false;
        // Cas classique
        if (ranks[0] - ranks[4] === 4) return true;
        // Cas de la quinte "Roue" (A-2-3-4-5)
        if (ranks[0] === 14 && ranks[1] === 5 && ranks[4] === 2) return true;
        return false;
    }

    static getBestHand(allSevenCards: PlayCard[]) {
        let bestResult = { rank: -1, value: -1, cards: [] as PlayCard[] };

        // Génère toutes les combinaisons de 5 parmi 7
        const combinations = this.getCombinations(allSevenCards, 5);

        for (const combo of combinations) {
            const result = this.evaluate(combo);
            if (result.value > bestResult.value) {
                bestResult = { ...result, cards: combo };
            }
        }

        return bestResult;
    }

    // Algorithme récursif pour générer les combinaisons
    private static getCombinations(array: PlayCard[], size: number): PlayCard[][] {
        const result: PlayCard[][] = [];

        const helper = (start: number, currentCombo: PlayCard[]) => {
            if (currentCombo.length === size) {
                result.push([...currentCombo]);
                return;
            }

            for (let i = start; i < array.length; i++) {
                currentCombo.push(array[i]);
                helper(i + 1, currentCombo);
                currentCombo.pop();
            }
        };

        helper(0, []);
        return result;
    }
}