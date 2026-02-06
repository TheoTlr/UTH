import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { GameEngine } from './core/GameEngine';
import { motion, AnimatePresence } from 'framer-motion';

const engine = new GameEngine();
const UNIT = 5;

export default function App() {
    const [gameState, setGameState] = useState<'IDLE' | 'BETTING' | 'PREFLOP' | 'FLOP' | 'RIVER' | 'SHOWDOWN'>('IDLE');
    const [playerHand, setPlayerHand] = useState(engine.playerHand);
    const [dealerHand, setDealerHand] = useState(engine.dealerHand);
    const [board, setBoard] = useState(engine.communityCards);
    const [result, setResult] = useState<any>(null);

    const [bankroll, setBankroll] = useState(1000);
    const [stats, setStats] = useState({ wins: 0, losses: 0 });
    const [bets, setBets] = useState({ ante: 0, trips: 0 });
    const [ante, setAnte] = useState(0);
    const [blind, setBlind] = useState(0);
    const [trips, setTrips] = useState(0);
    const [playBet, setPlayBet] = useState(0);

    // Fonctions de mise
    const placeBets = () => {
        if (bankroll < UNIT * 2) return; // Ante + Blind minimum
        setAnte(UNIT);
        setBlind(UNIT);
        setBankroll(prev => prev - (UNIT * 2));
        setGameState('BETTING');
    };

    const addTrips = () => {
        if (bankroll < UNIT) return;
        setTrips(prev => prev + UNIT);
        setBankroll(prev => prev - UNIT);
    };

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
        /* 1. CONTENEUR PARENT EN LIGNE (flex-row) */
        <div className="h-screen w-screen bg-slate-900 flex flex-row overflow-hidden font-sans text-white">

            {/* 2. LA SIDEBAR (Fixe à gauche) */}
            <Sidebar />

            {/* 3. ZONE DE JEU (Prend tout l'espace restant) */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8 relative h-full">

                <div className="grid col-span-3 grid-rows-2 h-full">
                    <div className="row-span-1 ">

                    </div>

                    <div className="w-full row-span-1  border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col gap-3">

                        <div className="flex flex-row items-center py-2 h-full">
                            <div className="w-45 grid grid-rows-3  h-full">
                                {/* 1. Zone TRIPS */}
                                <div className="flex row-span-1  justify-center items-center">
                                    <BetCircle
                                        label="TRIPS"
                                        isRhombus={true}
                                        amount={trips}
                                        onClick={gameState === 'BETTING' ? addTrips : undefined}
                                        color="border-white text-white opacity-70"
                                    />
                                </div>

                                {/* 2. Zone ANTE & BLIND */}
                                <div className="flex row-span-1  justify-center items-center">
                                    <BetCircle
                                        label="ANTE"
                                        amount={ante}
                                        color="border-white text-white opacity-70"
                                    />
                                </div>

                                {/* 3. Zone PLAY */}
                                <div className="flex row-span-1  justify-center items-center">
                                    <BetCircle
                                        label="PLAY"
                                        amount={playBet}
                                        color="border-gold text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                    />
                                </div>
                            </div>
                            <div className="w-45 grid grid-rows-3  h-full">
                                <div className="flex w-45 row-span-1 justify-start">
                                    <div className="w-10 flex items-center justify-center">
                                        <span className="text-red-700 text-[25px] transform -rotate-90 uppercase font-bold tracking-tighter whitespace-nowrap"> T R I P S </span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px]"> Royal Flush ----- 50 to 1 </span>
                                        <span className="text-[10px]"> Straight Flush -- 40 to 1 </span>
                                        <span className="text-[10px]"> Quads ---------- 30 to 1 </span>
                                        <span className="text-[10px]"> Full House ------- 8 to 1 </span>
                                        <span className="text-[10px]"> Flush ------------- 7 to 1 </span>
                                        <span className="text-[10px]"> Straight ---------- 4 to 1 </span>
                                        <span className="text-[10px]"> Trips ------------- 3 to 1 </span>
                                    </div>
                                </div>

                                <div className="flex row-span-1 justify-center items-center">
                                    <BetCircle
                                        label="BLIND"
                                        amount={blind}
                                        color="border-white text-white opacity-70"
                                    />
                                </div>

                                <div className="flex w-45 row-span-1">
                                    <div className="w-10 flex items-center justify-center">
                                        <span className="text-red-700 text-[24px] transform -rotate-90 uppercase font-bold tracking-tighter whitespace-nowrap"> B L I N D </span>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[10px]"> Royal Flush ----- 500 to 1 </span>
                                        <span className="text-[10px]"> Straight Flush ---- 50 to 1 </span>
                                        <span className="text-[10px]"> Quads ------------ 10 to 1 </span>
                                        <span className="text-[10px]"> Full House --------- 3 to 1 </span>
                                        <span className="text-[10px]"> Flush --------------- 3 to 2 </span>
                                        <span className="text-[10px]"> Straight ------------ 1 to 1 </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center">
                            <div className="items-center gap-3 flex">
                                <span className="text-white uppercase font-bold tracking-tighter">SOLDE : </span>
                                <span className="text-lg font-mono font-black text-white">{bankroll.toLocaleString()} €</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-6 grid grid-rows-6 h-full">
                    {/* SECTION DEALER */}
                    <div className="flex flex-col items-center gap-2 row-span-2 ">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Croupier</div>
                        <div className="flex gap-2">
                            {dealerHand.map((c, i) => (
                                <Card key={`dealer-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} hidden={gameState !== 'SHOWDOWN'} />
                            ))}
                        </div>
                    </div>

                    {/* SECTION PLATEAU (COMMUNITY CARDS) */}
                    <div className="relative bg-pokerGreen/20 p-8 row-span-2 rounded-[40px] border-2 border-white/5 flex flex-col items-center gap-4 min-w-[600px]">
                        <div className="text-xs font-bold uppercase tracking-widest text-pokerGreen/60 absolute -top-3 bg-slate-900 px-4">Table</div>
                        <div className="flex gap-3">
                            {board.map((c, i) => {
                                const isVisible = (gameState === 'FLOP' && i < 3) || (gameState === 'RIVER' || gameState === 'SHOWDOWN');
                                const isTurnRiver = i >= 3;

                                if (gameState === 'PREFLOP') return <Card key={i} rank="" suit="" hidden />;
                                if (gameState === 'FLOP' && isTurnRiver) return <Card key={i} rank="" suit="" hidden />;

                                return <Card key={i} rank={getRankLabel(c.rank)} suit={c.suit} />;
                            })}
                        </div>

                        <AnimatePresence>
                            {gameState === 'SHOWDOWN' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -bottom-6 bg-gold text-black px-6 py-2 rounded-full font-black text-xl shadow-2xl z-10"
                                >
                                    {result.winner === 'PLAYER' ? 'VOUS GAGNEZ !' : 'LE CROUPIER GAGNE'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SECTION JOUEUR */}
                    <div className="grid grid-cols-6 flex-col items-center row-span-2 gap-6">
                        <div className="flex gap-4 col-span-2">
                            {playerHand.map((c, i) => (
                                <Card key={`player-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} />
                            ))}
                        </div>

                        {/* CONTRÔLES DE JEU */}
                        <div className="bg-white/5 p-4 rounded-2xl col-span-2 backdrop-blur-md border border-white/10 flex gap-4">
                            {gameState === 'IDLE' && (
                                <button onClick={placeBets} className="btn-highlight">Placer les Mises ({UNIT*2}€)</button>
                            )}
                            {gameState === 'BETTING' && (
                                <button onClick={startHand} className="btn-primary">Distribuer</button>
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

            </main>
        </div>
    );
}

function BetInput({ label, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{label}</label>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                <button onClick={() => onChange(Math.max(0, value - 5))} className="w-8 h-8 hover:bg-white/10 rounded text-gold">-</button>
                <input type="number" value={value} readOnly className="bg-transparent text-center flex-1 font-mono text-sm outline-none" />
                <button onClick={() => onChange(value + 5)} className="w-8 h-8 hover:bg-white/10 rounded text-gold">+</button>
            </div>
        </div>
    );
}

function BetCircle({ label, amount, onClick, color, isRhombus = false }: any) {
    return (
        <div onClick={onClick} className={`${isRhombus ? 'rotate-45 w-16 h-16' : 'rounded-full w-20 h-20'} border-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 bg-black/20 ${color} ${amount > 0 ? 'bg-opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-dashed opacity-50'}`}>
            <span className={`text-[10px] ${isRhombus ? 'rotate-315' : '' } font-bold`}>{label}</span>
            <span className="text-lg font-black">{amount > 0 ? `${amount}€` : ''}</span>
        </div>
    );
}

function getRankLabel(rank: number) {
    const map: any = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    return map[rank] || rank.toString();
}