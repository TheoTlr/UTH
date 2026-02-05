import {
    LayoutGrid,
    MessageSquare,
    Calendar,
    ListTodo,
    Layers,
    Settings,
    ChevronUp,
    ChevronDown
} from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="w-20 h-screen bg-[#0F0F0F] flex flex-col items-center py-6 border-r border-white/5">

            {/* LOGO / AVATAR DU HAUT */}
            <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-10 border border-white/10">
                <div className="w-6 h-6 border-2 border-white/40 rounded rotate-45 flex items-center justify-center">
                    <div className="w-full h-[2px] bg-white/40 rotate-90" />
                </div>
            </div>

            {/* SÉLECTEUR DE CONTEXTE (Les flèches haut/bas) */}
            <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex flex-col items-center justify-center gap-1 mb-12 text-gray-400 hover:text-white cursor-pointer transition-colors">
                <ChevronUp size={14} />
                <ChevronDown size={14} />
            </div>

            {/* NAVIGATION PRINCIPALE */}
            <nav className="flex flex-col gap-8 flex-1">

                <SidebarIcon icon={<LayoutGrid size={24} />} />

                <SidebarIcon
                    icon={<MessageSquare size={24} />}
                    badgeColor="bg-purple-400"
                />

                <SidebarIcon icon={<Calendar size={24} />} />

                {/* LIGNE DE SÉPARATION */}
                <div className="w-8 h-[1px] bg-white/10 mx-auto my-2" />

                <SidebarIcon icon={<ListTodo size={24} />} />

                {/* ICÔNE ACTIVE (Avec le fond carré et point bleu) */}
                <SidebarIcon
                    icon={<Layers size={24} />}
                    active
                    badgeColor="bg-cyan-400"
                />
            </nav>

            {/* BAS DE LA SIDEBAR */}
            <div className="mt-auto">
                <SidebarIcon icon={<Settings size={24} />} />
            </div>

        </aside>
    );
}

interface SidebarIconProps {
    icon: React.ReactNode;
    active?: boolean;
    badgeColor?: string;
}

function SidebarIcon({ icon, active, badgeColor }: SidebarIconProps) {
    return (
        <div className="relative group cursor-pointer">
            <div className={`
        w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
        ${active ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
      `}>
                {icon}
            </div>

            {/* POINT DE NOTIFICATION */}
            {badgeColor && (
                <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full border-2 border-[#0F0F0F] ${badgeColor}`} />
            )}
        </div>
    );
}