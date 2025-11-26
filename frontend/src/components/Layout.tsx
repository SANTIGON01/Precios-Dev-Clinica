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
    X
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
            "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform",
            isOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0 lg:static lg:inset-auto"
        )}>
            <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
                <span className="text-xl font-bold tracking-wider">CLÍNICA CUYO</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-white hover:bg-slate-800"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-6 w-6" />
                </Button>
            </div>

            <nav className="px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center px-4 py-3 rounded-lg transition-colors group",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 w-full p-4 bg-slate-950">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        SG
                    </div>
                    <div>
                        <p className="text-sm font-medium">Santiago G.</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="font-semibold text-slate-800">Sistema de Precios</span>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
