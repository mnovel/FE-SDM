// src/components/layouts/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { menuItems } from '../../config/menuConfig';

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    useEffect(() => {
        menuItems.forEach(menu => {
            if (menu.children) {
                const isChildActive = menu.children.some(child => location.pathname.startsWith(child.path));
                if (isChildActive) {
                    setOpenMenus(prev => ({ ...prev, [menu.name]: true }));
                }
            }
        });
    }, [location.pathname]);

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    };

    return (
        <aside
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out
                ${isCollapsed && !isHovered ? 'lg:w-20' : 'lg:w-64'} w-64
                lg:translate-x-0 lg:static flex flex-col h-screen
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className={`h-20 flex items-center ${isCollapsed && !isHovered ? 'justify-center px-0' : 'justify-between px-5'} border-b border-slate-200 shrink-0 transition-all duration-300`}>
                <div className="flex items-center gap-3 overflow-hidden">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="w-8 h-8 object-contain shrink-0"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/30?text=L";
                        }}
                    />
                    {(!isCollapsed || isHovered) && (
                        <span className="text-lg font-bold text-slate-800 tracking-tight whitespace-nowrap animate-in fade-in">{import.meta.env.VITE_APP_NAME}</span>
                    )}
                </div>
                {(!isCollapsed || isHovered) && (
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
                        </svg>
                    </button>
                )}
            </div>

            <div className={`p-4 border-b border-slate-200 shrink-0 transition-all duration-300 ${isCollapsed && !isHovered ? 'flex justify-center px-2' : ''}`}>
                <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${isCollapsed && !isHovered ? 'justify-center' : ''}`}>
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="avatar" className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200" />
                    {(!isCollapsed || isHovered) && (
                        <div className="flex-1 min-w-0 animate-in fade-in">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[11px] text-slate-500 truncate">20032025021300103</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-1">
                {menuItems.map((menu) => {
                    if (menu.children) {
                        const isOpen = openMenus[menu.name] && (!isCollapsed || isHovered);
                        const isParentActive = menu.children.some(child => location.pathname.startsWith(child.path));

                        return (
                            <div key={menu.name} className="flex flex-col relative group">
                                <button
                                    onClick={() => toggleMenu(menu.name)}
                                    className={`
                                        flex items-center ${isCollapsed && !isHovered ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full
                                        ${isParentActive ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                                    `}
                                    title={isCollapsed && !isHovered ? menu.name : ''}
                                >
                                    <div className={`flex items-center ${isCollapsed && !isHovered ? 'justify-center' : 'gap-3'}`}>
                                        <svg className={`w-5 h-5 shrink-0 ${isParentActive ? 'text-orange-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon} />
                                        </svg>
                                        {(!isCollapsed || isHovered) && <span className="animate-in fade-in">{menu.name}</span>}
                                    </div>
                                    {(!isCollapsed || isHovered) && (
                                        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isParentActive ? 'text-orange-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>

                                {(!isCollapsed || isHovered) && (
                                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            <div className="ml-4 pl-3 border-l-2 border-slate-100 flex flex-col space-y-1 pb-1 pt-1">
                                                {menu.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setIsSidebarOpen(false)}
                                                        className={({ isActive }) => `
                                                            px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-3
                                                            ${isActive ? 'text-orange-700 font-semibold bg-orange-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'}
                                                        `}
                                                    >
                                                        {({ isActive }) => (
                                                            <>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-orange-500' : 'bg-slate-300'}`} />
                                                                {child.name}
                                                            </>
                                                        )}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={menu.path}
                            to={menu.path}
                            onClick={() => setIsSidebarOpen(false)}
                            title={isCollapsed && !isHovered ? menu.name : ''}
                            className={({ isActive }) => `
                                flex items-center ${isCollapsed && !isHovered ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon} />
                                    </svg>
                                    {(!isCollapsed || isHovered) && <span className="animate-in fade-in">{menu.name}</span>}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="shrink-0 p-4 border-t border-slate-200">
                <button
                    onClick={logout}
                    title={isCollapsed && !isHovered ? "Logout" : ""}
                    className={`w-full flex items-center ${isCollapsed && !isHovered ? 'justify-center' : 'justify-center gap-2'} bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`}
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {(!isCollapsed || isHovered) && <span className="animate-in fade-in">Logout</span>}
                </button>
            </div>
        </aside>
    );
}