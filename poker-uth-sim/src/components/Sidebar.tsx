import {
    ChevronUp,
    ChevronDown
} from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="w-20 h-screen bg-[#0F0F0F] flex flex-col items-center py-6 border-r border-white/5">

            {/* LOGO / AVATAR DU HAUT */}
            <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-10 border border-white/10">
                {/* Losange externe */}
                <div className="w-8 h-8 rotate-45 flex items-center justify-center">
                    {/* Cercle interne pour le symbole */}
                    <div className="w-6 h-6 flex items-center justify-center">
                        {/* Symbole de carte (pique ici, tu peux changer par ♥ ♦ ♣) */}
                        <span className="text-white text-lg font-bold">♠</span>
                    </div>
                </div>
            </div>


            {/* SÉLECTEUR DE CONTEXTE (Les flèches haut/bas) */}
            <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex flex-col items-center justify-center gap-1 mb-12 text-gray-400 hover:text-white cursor-pointer transition-colors">
                <ChevronUp size={14} />
                <ChevronDown size={14} />
            </div>

            {/* NAVIGATION PRINCIPALE */}
            <nav className="flex flex-col gap-8 flex-1">

            </nav>

            {/* BAS DE LA SIDEBAR */}
            <div className="mt-auto">
            </div>

        </aside>
    );
}