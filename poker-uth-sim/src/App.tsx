import { useState, useMemo } from 'react';
import { Card } from './components/Card';
import { GameEngine } from './core/GameEngine';
import { motion, AnimatePresence } from 'framer-motion';

const engine = new GameEngine();

export default function App() {
    const [gameState, setGameState] = useState<'IDLE' | 'PREFLOP' | 'FLOP' | 'RIVER' | 'SHOWDOWN'>('IDLE');
    const [playerHand, setPlayerHand] = useState(engine.playerHand);
    const [dealerHand, setDealerHand] = useState(engine.dealerHand);
    const [board, setBoard] = useState(engine.communityCards);
    const [result, setResult] = useState<any>(null);

    const startHand = () => {
        engine.startNewGame();
        setPlayerHand([...engine.playerHand]);
        setDealerHand([...engine.dealerHand]);
        setBoard([...engine.communityCards]);
        setResult(null);
        setGameState('PREFLOP');
    };

    const revealFlop = () => setGameState('FLOP');
    const revealRiver = () => setGameState('RIVER');
    const showResults = () => {
        setResult(engine.getResult());
        setGameState('SHOWDOWN');
    };

    return (
        <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-between p-4 font-sans text-white overflow-hidden">

            {/* SECTION DEALER */}
            <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold uppercase tracking-widest text-white/40">Croupier</div>
                <div className="flex gap-2">
                    {dealerHand.map((c, i) => (
                        <Card key={`dealer-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} hidden={gameState !== 'SHOWDOWN'} />
                    ))}
                </div>
            </div>

            {/* SECTION PLATEAU (COMMUNITY CARDS) */}
            <div className="relative bg-pokerGreen/20 p-8 rounded-[40px] border-2 border-white/5 flex flex-col items-center gap-4 min-w-[600px]">
                <div className="text-xs font-bold uppercase tracking-widest text-pokerGreen/60 absolute -top-3 bg-slate-900 px-4">Table</div>
                <div className="flex gap-3">
                    {board.map((c, i) => {
                        const isVisible = (gameState === 'FLOP' && i < 3) || (gameState === 'RIVER' || gameState === 'SHOWDOWN');
                        const isFlop = i < 3;
                        const isTurnRiver = i >= 3;

                        // Logique d'affichage progressive
                        if (gameState === 'PREFLOP') return <Card key={i} rank="" suit="" hidden />;
                        if (gameState === 'FLOP' && isTurnRiver) return <Card key={i} rank="" suit="" hidden />;

                        return <Card key={i} rank={getRankLabel(c.rank)} suit={c.suit} />;
                    })}
                </div>

                {/* Affichage du Gagnant */}
                <AnimatePresence>
                    {gameState === 'SHOWDOWN' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -bottom-6 bg-gold text-black px-6 py-2 rounded-full font-black text-xl shadow-2xl"
                        >
                            {result.winner === 'PLAYER' ? 'VOUS GAGNEZ !' : 'LE CROUPIER GAGNE'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SECTION JOUEUR */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex gap-4">
                    {playerHand.map((c, i) => (
                        <Card key={`player-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} />
                    ))}
                </div>

                {/* CONTRÔLES DE JEU */}
                <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-white/10 flex gap-4">
                    {gameState === 'IDLE' && (
                        <button onClick={startHand} className="btn-primary">Nouvelle Main</button>
                    )}
                    {gameState === 'PREFLOP' && (
                        <button onClick={revealFlop} className="btn-action">Parier x4 / Check</button>
                    )}
                    {gameState === 'FLOP' && (
                        <button onClick={revealRiver} className="btn-action">Parier x2 / Check</button>
                    )}
                    {gameState === 'RIVER' && (
                        <button onClick={showResults} className="btn-highlight">Révéler</button>
                    )}
                    {gameState === 'SHOWDOWN' && (
                        <button onClick={startHand} className="btn-primary">Rejouer</button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Utilitaire pour le texte des cartes
function getRankLabel(rank: number) {
    const map: any = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    return map[rank] || rank.toString();
}