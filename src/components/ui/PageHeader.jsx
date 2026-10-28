import { Link, useLocation } from 'react-router-dom';

export default function PageHeader({ title, description }) {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <div className="mb-6">
            {/* Judul Halaman */}
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>

            {/* Deskripsi Singkat */}
            {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-3 font-medium">
                <Link to="/" className="hover:text-orange-500 transition-colors">Dashboard</Link>
                {pathnames.map((name, index) => {
                    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
                    return (
                        <span key={name} className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px]">•</span>
                            {isLast ? (
                                <span className="text-slate-800">{formattedName}</span>
                            ) : (
                                <Link to={routeTo} className="hover:text-orange-500 transition-colors">{formattedName}</Link>
                            )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}