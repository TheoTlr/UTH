// src/core/GameEngine.ts
import { Deck } from './Deck';
import { HandEvaluator } from './Evaluator';
import type {PlayCard} from './types';

export class GameEngine {
    deck: Deck;
    playerHand: PlayCard[] = [];
    dealerHand: PlayCard[] = [];
    communityCards: PlayCard[] = [];

    constructor() {
        this.deck = new Deck();
    }

    startNewGame() {
        this.deck.reset();
        this.deck.shuffle();

        // Distribution initiale
        this.playerHand = [this.deck.draw()!, this.deck.draw()!];
        this.dealerHand = [this.deck.draw()!, this.deck.draw()!];
        this.communityCards = [
            this.deck.draw()!, this.deck.draw()!, this.deck.draw()!, // Flop
            this.deck.draw()!, // Turn
            this.deck.draw()!  // River
        ];
    }

    getResult() {
        const playerBest = HandEvaluator.getBestHand([...this.playerHand, ...this.communityCards]);
        const dealerBest = HandEvaluator.getBestHand([...this.dealerHand, ...this.communityCards]);

        // Vérification qualification Dealer (Paire de 2 ou mieux)
        const dealerQualifies = dealerBest.value >= Math.pow(15, 5);

        return {
            playerBest,
            dealerBest,
            winner: playerBest.value > dealerBest.value ? 'PLAYER' : 'DEALER',
            dealerQualifies
        };
    }
}