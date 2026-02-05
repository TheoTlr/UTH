import type {Card, Suit, Rank} from './types';

export class Deck {
    private cards: Card[] = [];

    constructor() {
        this.reset();
    }

    // Initialise un paquet de 52 cartes
    reset(): void {
        const suits: Suit[] = ['H', 'D', 'C', 'S'];
        const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

        this.cards = [];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.cards.push({ rank, suit });
            }
        }
    }

    /**
     * Mélange de Fisher-Yates avec hasard cryptographique
     */
    shuffle(): void {
        const array = new Uint32Array(this.cards.length);
        window.crypto.getRandomValues(array);

        for (let i = this.cards.length - 1; i > 0; i--) {
            // On utilise le tableau de nombres aléatoires sécurisés pour l'index
            const j = array[i] % (i + 1);
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Tire une carte du dessus du paquet
    draw(): Card | undefined {
        return this.cards.pop();
    }

    // Pour débugger : voir combien de cartes il reste
    get remaining(): number {
        return this.cards.length;
    }
}