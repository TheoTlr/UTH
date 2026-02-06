import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { GameEngine } from './core/GameEngine';
import { motion, AnimatePresence } from 'framer-motion';
import {getHandLabel} from "./core/handLabel.ts";
import {HandEvaluator} from "./core/Evaluator.ts";
import type { PlayCard, HandRecord } from './core/types';

const engine = new GameEngine();
const UNIT = 5;

export default function App() {
    const [gameState, setGameState] = useState<'BETTING' | 'PREFLOP' | 'FLOP' | 'RIVER' | 'SHOWDOWN'>('BETTING');
    const [playerHand, setPlayerHand] = useState(engine.playerHand);
    const [dealerHand, setDealerHand] = useState(engine.dealerHand);
    const [board, setBoard] = useState(engine.communityCards);
    const [result, setResult] = useState<any>(null);

    const [bankroll, setBankroll] = useState(1000);
    const [ante, setAnte] = useState(0);
    const [blind, setBlind] = useState(0);
    const [trips, setTrips] = useState(0);
    const [playBet, setPlayBet] = useState(0);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [handHistory, setHandHistory] = useState<HandRecord[]>([]);

    const statsPercent = useMemo(() => {
        const total = handHistory.length;
        if (total === 0) return { win: 0, loss: 0, fold: 0 };

        const win = handHistory.filter(h => h.result === 'WIN').length;
        const loss = handHistory.filter(h => h.result === 'LOSS').length;
        const fold = handHistory.filter(h => h.result === 'FOLD').length;

        return {
            win: Math.round((win / total) * 100),
            loss: Math.round((loss / total) * 100),
            fold: Math.round((fold / total) * 100),
        };
    }, [handHistory]);


    const isPlaying = gameState !== 'BETTING';

    const [handCroupier, setHandCroupier] = useState('');

    const incrementAnte = () => {
        if (bankroll < UNIT) return; // Vérifie si on a assez
        setAnte(prev => prev + UNIT);
        setBlind(prev => prev + UNIT); // Blind = Ante
    };

    const decrementAnte = () => {
        if (ante <= 0) return;
        setAnte(prev => prev - UNIT);
        setBlind(prev => prev - UNIT); // Blind = Ante
    };

    const incrementTrips = () => {
        if (bankroll < UNIT) return;
        setTrips(prev => prev + UNIT);
    };

    const decrementTrips = () => {
        if (trips <= 0) return;
        setTrips(prev => prev - UNIT);
    };

    // PREFLOP : Parier x4 / x3 ou Check
    const playPreflop = () => {
        const amount = ante * 4;
        if (bankroll < amount) return;

        setPlayBet(amount);
        setHasPlayed(true);

        // On saute directement au showdown
        revealAllAndShowdown(amount);
    };

    const checkPreflop = () => {
        setGameState('FLOP');
    };

    // FLOP : Parier x2 ou Check
    const playFlop = () => {
        const amount = ante * 2;
        if (bankroll < amount) return;

        setPlayBet(amount);
        setHasPlayed(true);

        revealAllAndShowdown(amount);
    };

    const checkFlop = () => {
        setGameState('RIVER');
    };

    // RIVER : Parier ou Check
    const playRiver = () => {
        const amount = ante;
        if (bankroll < amount) return;

        setPlayBet(amount);
        setHasPlayed(true);

        showResults(amount);
    };

    const checkRiver = () => {
        // Fold → perte automatique ANTE + BLIND
        showResults(0, true);
    };

    const revealAllAndShowdown = (forcedPlayBet = playBet) => {
        const res = engine.getResult();

        setResult(res);
        getHandCroupierLabel(res);
        resolvePayout(res, forcedPlayBet);
        setGameState('SHOWDOWN');
    };

    const resolvePayout = (res: any, resolvedPlayBet: number, fold: boolean = false) => {
        const playerWins = res.winner === 'PLAYER';
        const dealerQualifies = res.dealerQualifies;

        // ===== DÉDUCTION DES MISES =====
        const totalBets = ante + blind + trips + resolvedPlayBet;

        console.log('Total misé :', totalBets, ' (Ante:', ante, 'Blind:', blind, 'Trips:', trips, 'PlayBet:', resolvedPlayBet, ')');

        if (fold) {
            setBankroll(b => b - totalBets)

            const handResult: HandRecord = {
                result: 'FOLD',
                amount: -totalBets,
                playerHandLabel: bestHand ? getHandLabel(bestHand) : '',
                croupierHandLabel: getHandLabel(res.dealerBest)
            };

            setHandHistory(prev => [handResult, ...prev]);

            return
        }

        let netChange = -totalBets;

        // ===== PLAY BET =====
        if (resolvedPlayBet > 0 && playerWins) {
            netChange += resolvedPlayBet * 2;
        }

        // ===== ANTE =====
        if (playerWins) {
            netChange += dealerQualifies ? ante * 2 : ante;
        }

        // ===== BLIND =====
        if (playerWins) {
            const m = getBlindMultiplier(res.playerBest.rank);
            netChange += blind * m;
        }

        // ===== TRIPS =====
        if (trips > 0) {
            const m = getTripsMultiplier(res.playerBest.rank);
            if (m > 0) netChange += trips * (m + 1);
        }

        const handResult: HandRecord = {
            result: (playerWins ? 'WIN' : 'LOSS'),
            amount: (playerWins ? netChange : -totalBets),
            playerHandLabel: bestHand ? getHandLabel(bestHand) : '',
            croupierHandLabel : getHandLabel(res.dealerBest)
        };

        setHandHistory(prev => [handResult, ...prev]);
        setBankroll(b => b + netChange);
    };


    const getBlindMultiplier = (rank: number) => {
        switch (rank) {
            case 9: return 500; // Royal
            case 8: return 50;
            case 7: return 10;
            case 6: return 3;
            case 5: return 2.5;
            case 4: return 1;
            default: return 0;
        }
    };

    const getTripsMultiplier = (rank: number) => {
        switch (rank) {
            case 9: return 50;
            case 8: return 40;
            case 7: return 30;
            case 6: return 8;
            case 5: return 7;
            case 4: return 4;
            case 3: return 3;
            case 1: return 1;
            default: return 0;
        }
    };

    const getHandCroupierLabel= (result: any) => {
        const t = HandEvaluator.getBestHand(result.dealerBest.cards)
        setHandCroupier(getHandLabel(t));
    }

    const showResults = (forcedPlayBet = playBet, fold = false) => {
        const res = engine.getResult();
        setResult(res);
        getHandCroupierLabel(res);
        resolvePayout(res, forcedPlayBet, fold);
        setGameState('SHOWDOWN');
    };

    const resetHand = () => {
        setPlayBet(0);
        setHandCroupier('');
        setHasPlayed(false);
        setResult(null);
        setGameState('BETTING');
    };

    const startHand = () => {
        const total = ante + blind + trips;
        if (bankroll < total) return; // juste check
        engine.startNewGame();
        setPlayerHand([...engine.playerHand]);
        setDealerHand([...engine.dealerHand]);
        setBoard([...engine.communityCards]);
        setResult(null);
        setGameState('PREFLOP');
    };

    function getVisibleBoard(board: PlayCard[], gameState: string) {
        switch (gameState) {
            case 'PREFLOP':
                return board;
            case 'FLOP':
                return board.slice(0, 3); // seulement le flop
            case 'RIVER':
                return board; // flop + turn
            case 'SHOWDOWN':
                return board; // tout le board
            default:
                return []; // PREFLOP : aucune carte visible
        }
    }

    const bestHand = useMemo(() => {
        const visibleBoard = getVisibleBoard(board, gameState);

        console.log("playerHand", engine.getResult());
        if (playerHand.length === 0) return null;

        // Combine cartes du joueur + board visible
        const cardsToEvaluate = [...playerHand, ...visibleBoard];

        // On récupère la meilleure main possible avec seulement ces cartes
        return HandEvaluator.getBestHand(cardsToEvaluate);
    }, [playerHand, board, gameState]);

    const handLabel =
        (gameState === 'FLOP' || gameState === 'RIVER' || gameState === 'SHOWDOWN') && bestHand
            ? getHandLabel(bestHand)
            : null;

    return (
        /* 1. CONTENEUR PARENT */
        <div className="h-screen w-screen bg-slate-900 flex flex-row overflow-hidden font-sans text-white relative">

            {/* MOTIF RÉPÉTITIF (♣ ♦ ♥ ♠) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='30' fill='white' font-family='serif' font-size='20'%3E♠%3C/text%3E%3Ctext x='120' y='80' fill='white' font-family='serif' font-size='20'%3E♥%3C/text%3E%3Ctext x='50' y='150' fill='white' font-family='serif' font-size='20'%3E♣%3C/text%3E%3Ctext x='170' y='160' fill='white' font-family='serif' font-size='20'%3E♦%3C/text%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px',
                    filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.6)) blur(0.3px)'
                }}
            />

            {/* 2. LA SIDEBAR */}
            <Sidebar />

            {/* 3. ZONE DE JEU */}
            <main className="flex-1 grid grid-cols-12 gap-6 p-8 relative h-full z-10">

                <div className="grid col-span-3 grid-rows-2 h-full">
                    <div id="StatsPanel" className="row-span-1 h-100 w-full border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-3">
                        {/* Stats globales */}
                        <div className="flex justify-between mb-2 text-xs font-bold uppercase text-white/80">
                            <span>Win: {statsPercent.win}%</span>
                            <span>Loss: {statsPercent.loss}%</span>
                            <span>Fold: {statsPercent.fold}%</span>
                        </div>

                        {/* Datatable des mains */}
                        <div className="overflow-y-auto max-h-[200px]">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                <tr className="border-b border-white/20">
                                    <th className="p-1">Résultat</th>
                                    <th className="p-1">Gain / Perte</th>
                                    <th className="p-1">Main</th>
                                    <th className="p-1">Main Croupier</th>
                                </tr>
                                </thead>
                                <tbody>
                                {handHistory.map((h, i) => (
                                    <tr key={i} className="border-b border-white/10">
                                        <td className={`p-1 font-bold ${h.result === 'WIN' ? 'text-green-400' : h.result === 'LOSS' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {h.result}
                                        </td>
                                        <td className={`p-1 ${h.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {h.amount >= 0 ? `+${h.amount}€` : `${h.amount}€`}
                                        </td>
                                        <td className="p-1">{h.playerHandLabel}</td>
                                        <td className="p-1">{h.croupierHandLabel}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <div className="w-full row-span-1 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-3">
                        <div className="flex flex-row items-center py-2 h-full">
                            <div className="w-45 grid grid-rows-3 h-full">
                                <div className="flex row-span-1 justify-center items-center">
                                    <BetCircle
                                        label="TRIPS"
                                        isRhombus={true}
                                        amount={trips}
                                        onIncrement={incrementTrips}
                                        onDecrement={decrementTrips}
                                        color="border-white text-white opacity-70"
                                        canIncrement={bankroll >= UNIT}
                                        canDecrement={trips > 0}
                                        isPlaying={isPlaying}
                                    />
                                </div>
                                <div className="flex row-span-1 justify-center items-center">
                                    <BetCircle label="ANTE" amount={ante} isPlaying={isPlaying} color="border-white text-white opacity-70" onDecrement={decrementAnte} onIncrement={incrementAnte} canIncrement={bankroll >= UNIT} canDecrement={ante > 0}/>
                                </div>
                                <div className="flex row-span-1 justify-center items-center">
                                    <BetCircle label="PLAY" amount={playBet} isPlaying={isPlaying} color="border-gold text-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]" isPlay={true}/>
                                </div>
                            </div>
                            <div className="w-45 grid grid-rows-3 h-full">
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
                                    <BetCircle label="BLIND" isPlaying={isPlaying} amount={blind} color="border-white text-white opacity-70" isPlay={true}/>
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
                        <div className="flex justify-between items-center">
                            <div className="items-center justify-start gap-3 flex">
                                <span className="text-white uppercase font-bold tracking-tighter">SOLDE : </span>
                                <span className="text-lg font-mono font-black text-white">{bankroll.toLocaleString()} €</span>
                            </div>

                            {gameState === 'BETTING' && (
                                <button disabled={ante <= 0} onClick={startHand} className={`btn-primary ${ante <= 0 ? 'opacity-50' : ''} `}>Distribuer</button>
                            )}
                            {gameState === 'PREFLOP' && !hasPlayed && (
                                <>
                                    <button onClick={playPreflop} className="btn-action">
                                        Parier x4
                                    </button>
                                    <button onClick={checkPreflop} className="btn-secondary">
                                        Check
                                    </button>
                                </>
                            )}
                            {gameState === 'FLOP' && !hasPlayed && (
                                <>
                                    <button onClick={playFlop} className="btn-action">
                                        Parier x2
                                    </button>
                                    <button onClick={checkFlop} className="btn-secondary">
                                        Check
                                    </button>
                                </>
                            )}
                            {gameState === 'RIVER' && !hasPlayed && (
                                <>
                                    <button onClick={playRiver} className="btn-action">
                                        Parier x1
                                    </button>
                                    <button onClick={checkRiver} className="btn-secondary">
                                        Check
                                    </button>
                                </>
                            )}
                            {gameState === 'SHOWDOWN' && (
                                <button onClick={resetHand} className="btn-primary">Rejouer</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-span-6 grid grid-rows-6 h-full">
                    <div className="flex flex-col items-center gap-2 row-span-2 ">
                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Croupier</div>
                        <div className="flex flex-col justify-center items-center gap-3">
                            <div className="flex flex-row items-center gap-3">
                                {dealerHand.map((c, i) => (
                                    <Card key={`dealer-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} hidden={gameState !== 'SHOWDOWN'} />
                                ))}
                            </div>

                            <span className="text-sm font-bold tracking-wide justify-center text-yellow-300">
                               {handCroupier}
                            </span>
                        </div>
                    </div>

                    <div className="relative bg-pokerGreen/20 p-8 row-span-2 rounded-[40px] border-2 border-white/5 flex flex-col items-center gap-4 min-w-[600px]">
                        <div className="text-xs font-bold uppercase tracking-widest text-pokerGreen/60 absolute -top-3 bg-slate-900 px-4">Table</div>
                        <div className="flex gap-3">
                            {board.map((c, i) => {
                                const isTurnRiver = i >= 3;
                                if (gameState === 'PREFLOP') { // @ts-ignore
                                    return <Card key={i} rank="" suit="" hidden />;
                                }
                                if (gameState === 'FLOP' && isTurnRiver) { // @ts-ignore
                                    return <Card key={i} rank="" suit="" hidden />;
                                }
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

                    <div className="grid grid-cols-6 flex-col items-center row-span-2">
                        <div className="flex flex-col gap-4 col-span-2 justify-center items-center">
                            <div className="flex flex-row items-center gap-3">
                                {playerHand.map((c, i) => (
                                    <Card key={`player-${i}`} rank={getRankLabel(c.rank)} suit={c.suit} />
                                ))}
                            </div>

                            <span className="text-sm font-bold tracking-wide justify-center text-yellow-300">
                               {handLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function BetCircle({ label, amount, onIncrement, onDecrement, color, isRhombus = false, canIncrement = true, canDecrement = true, isPlay = false, isPlaying = false }: any) {
    const showControls = !isPlay && !isPlaying;

    return (
        <div className="relative w-20 h-20 flex items-center justify-center">

            {/* SHAPE (rotation uniquement ici) */}
            <div
                className={`
                    absolute inset-0
                    ${isRhombus ? 'rotate-45' : 'rounded-full'}
                    border-4
                    bg-black/20
                    transition-all
                    ${color}
                    ${amount > 0
                    ? 'bg-opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                    : 'border-dashed opacity-50'}
                `}

                style={{
                    left: isRhombus ? '4px' : '',
                    width: isRhombus ? '90%' : '',
                    height: isRhombus ? '90%' : '',
                }}
            />

            {/* CONTENU (non impacté par la rotation) */}
            <div className="relative z-10 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold">
                    {label}
                </span>

                <div className="flex items-center gap-1 mt-1">
                    {showControls  && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDecrement && onDecrement();
                            }}
                            disabled={!canDecrement}
                            className={`text-xs font-bold btn-mise ${
                                !canDecrement
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:text-yellow-300'
                            }`}
                        >
                            -
                        </button>
                    )}

                    <span className="text-lg font-black">
                        {amount > 0 ? `${amount}€` : ''}
                    </span>

                    {showControls  && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onIncrement && onIncrement();
                            }}
                            disabled={!canIncrement}
                            className={`text-xs font-bold btn-mise ${
                                !canIncrement
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'hover:text-yellow-300'
                            }`}
                        >
                            +
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function getRankLabel(rank: number) {
    const map: any = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    return map[rank] || rank.toString();
}