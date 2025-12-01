import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    History,
    Calculator,
    Scale,
    Lightbulb,
    FileText,
    Menu,
    X,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: History, label: 'Histórico', path: '/historico' },
        { icon: Calculator, label: 'Simulador', path: '/simulador' },
        { icon: Scale, label: 'Comparador', path: '/comparador' },
        { icon: Lightbulb, label: 'Oportunidades', path: '/oportunidades' },
        { icon: FileText, label: 'Reportes', path: '/reportes' },
    ];

    return (
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out transform shadow-2xl",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0 lg:static lg:inset-auto"
        )}>
            <div className="flex items-center justify-between h-20 px-8 bg-slate-950/50 backdrop-blur-sm border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                        <Activity className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        CLÍNICA CUYO
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            <nav className="px-4 py-8 space-y-2">
                <div className="px-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu Principal</p>
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-100 -z-10" />
                            )}
                            <Icon className={cn(
                                "h-5 w-5 mr-3 transition-transform duration-200",
                                isActive ? "text-white scale-110" : "text-slate-400 group-hover:text-white group-hover:scale-110"
                            )} />
                            <span className="font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-slate-950 to-transparent">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                        SG
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Santiago G.</p>
                        <p className="text-xs text-slate-400 truncate">Administrador</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 lg:hidden z-40 sticky top-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="hover:bg-slate-100"
                    >
                        <Menu className="h-6 w-6 text-slate-700" />
                    </Button>
                    <span className="font-bold text-slate-800 text-lg">Sistema de Precios</span>
                    <div className="w-10" />
                </header>

                <main className="flex-1 overflow-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
