import { motion } from "framer-motion";

export type Suit = "S" | "H" | "D" | "C" | "?";

type CardProps = {
    rank: string;
    suit: Suit;
    hidden?: boolean;
};

const suitMap: Record<Suit, string> = {
    S: "♠", H: "♥", D: "♦", C: "♣", "?": "",
};

const suitColor = (suit: Suit) =>
    suit === "H" || suit === "D" ? "text-red-600" : "text-slate-900";

// Cette fonction définit où placer les symboles selon le chiffre
const getPips = (rank: string) => {
    const num = parseInt(rank);
    if (isNaN(num)) return []; // Pour J, Q, K, A

    // Mapping des positions sur une grille imaginaire
    switch (num) {
        case 2: return ["center-30", "center-70"];
        case 3: return ["center-30", "center-50", "center-70"];
        case 4: return ["left-20", "left-80", "right-20", "right-80"];
        case 5: return ["left-20", "left-80", "center-50", "right-20", "right-80"];
        case 6: return ["left-10", "left-50", "left-90", "right-10", "right-50", "right-90"];
        case 7: return ["left-10", "left-50", "left-90", "center-50", "right-10", "right-50", "right-90"];
        case 8: return ["left-0", "left-30", "left-70", "left-100", "right-0", "right-30", "right-70", "right-100"];
        case 9: return ["left-0", "left-30", "left-70", "left-100", "center-50", "right-0", "right-30", "right-70", "right-100"];
        case 10: return ["left-0", "left-30", "left-70", "left-100", "center-30", "center-70", "right-0", "right-30", "right-70", "right-100"];
        default: return [];
    }
};

export function Card({ rank, suit, hidden = false }: CardProps) {
    const pips = getPips(rank);
    const isFaceCard = ["J", "Q", "K", "A"].includes(rank);

    return (
        <motion.div
            className="relative w-32 h-48 rounded-xl bg-white shadow-xl border border-black/10 select-none overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
        >
            {hidden ? (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center p-2">
                    <div className="w-full h-full border-2 border-white/20 rounded-lg bg-[repeating-linear-gradient(45deg,#1e293b,#1e293b_10px,#334155_10px,#334155_20px)]" />
                </div>
            ) : (
                <div className={`w-full h-full p-2 flex flex-col ${suitColor(suit)}`}>
                    {/* Index haut gauche */}
                    <div className="flex flex-col items-center self-start leading-none">
                        <span className="text-lg font-black">{rank}</span>
                        <span className="text-sm">{suitMap[suit]}</span>
                    </div>

                    {/* Zone centrale des Pips */}
                    <div className="flex-1 relative px-3">
                        {isFaceCard ? (
                            <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                {suitMap[suit]}
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                {pips.map((pos, i) => (
                                    <div key={i} className={`absolute text-xl transform -translate-x-1/2 -translate-y-1/2 ${getPositionClass(pos)}`}>
                                        {suitMap[suit]}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Index bas droit */}
                    <div className="flex flex-col items-center self-end leading-none rotate-180">
                        <span className="text-lg font-black">{rank}</span>
                        <span className="text-sm">{suitMap[suit]}</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Utilitaire pour placer les symboles sur la grille
function getPositionClass(pos: string) {
    const map: Record<string, string> = {
        "left-0": "top-[0%] left-[20%]",
        "right-0": "top-[0%] left-[80%]",
        "left-10": "top-[10%] left-[20%]",
        "right-10": "top-[10%] left-[80%]",
        "left-20": "top-[20%] left-[20%]",
        "right-20": "top-[20%] left-[80%]",
        "left-30": "top-[30%] left-[20%]",
        "right-30": "top-[30%] left-[80%]",
        "center-30": "top-[30%] left-[50%]",
        "left-40": "top-[40%] left-[20%]",
        "right-40": "top-[40%] left-[80%]",
        "center-40": "top-[40%] left-[50%]",
        "left-50": "top-[50%] left-[20%]",
        "right-50": "top-[50%] left-[80%]",
        "center-50": "top-[50%] left-[50%]",
        "left-60": "top-[60%] left-[20%]",
        "right-60": "top-[60%] left-[80%]",
        "center-60": "top-[60%] left-[50%]",
        "left-70": "top-[70%] left-[20%]",
        "right-70": "top-[70%] left-[80%]",
        "left-80": "top-[80%] left-[20%]",
        "center-70": "top-[70%] left-[50%]",
        "right-80": "top-[80%] left-[80%]",
        "left-90": "top-[90%] left-[20%]",
        "right-90": "top-[90%] left-[80%]",
        "left-100": "top-[100%] left-[20%]",
        "right-100": "top-[100%] left-[80%]",
    };
    return map[pos];
}