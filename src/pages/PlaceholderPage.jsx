import React from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PATHS } from '../routes/paths';

/**
 * Helper to dynamically format route segments or names into clean, readable titles.
 * Handles acronyms like QC, DMS, RX, GST and hyphenated numbers (process-1 -> Process 1).
 */
const formatSegment = (str) => {
    if (!str) return '';
    const clean = str.replace(/[_-]+/g, ' ').trim();
    const parts = clean.split(/\s+/);

    return parts.map(word => {
        const lower = word.toLowerCase();
        if (lower === 'qc') return 'QC';
        if (lower === 'arc') return 'ARC';
        if (lower === 'rx') return 'Rx';
        if (lower === 'dms') return 'DMS';
        if (lower === 'coa') return 'COA';
        if (lower === 'gst') return 'GST';
        if (lower === 'erp') return 'ERP';
        if (lower === 'api') return 'API';
        if (/^\d+$/.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
};

const getCategory = (title, path) => {
    const t = (title || '').toLowerCase();
    const p = (path || '').toLowerCase();
    if (t.includes('qc') || p.includes('qc') || t.includes('quality')) return 'Quality Control';
    if (t.includes('dispatch') || p.includes('dispatch') || t.includes('shipping')) return 'Shipping & Dispatch';
    if (p.includes('lab') || t.includes('process') || p.includes('surfacing') || p.includes('fitting') || t.includes('tint') || t.includes('hard coat') || t.includes('arc')) return 'Lab Operations';
    if (p.includes('account') || p.includes('payment') || p.includes('vendor') || p.includes('ledger')) return 'Accounting & Finance';
    if (p.includes('report')) return 'Reports & Analytics';
    if (p.includes('order')) return 'Order Management';
    return 'Manufacturing Operations';
};

const getIcon = (category, title, path) => {
    const t = (title || '').toLowerCase();
    const p = (path || '').toLowerCase();
    if (t === 'lab' || p.includes('lab')) return 'lucide:flask-conical';
    if (t === 'tint' || p.includes('tint')) return 'lucide:droplet';
    if (t === 'hard coat' || p.includes('hard-coat')) return 'lucide:shield';
    if (t === 'arc' || p.includes('arc')) return 'lucide:layers';
    if (t === 'qc' || p.includes('qc')) return 'lucide:clipboard-check';
    if (t === 'fitting' || p.includes('fitting')) return 'lucide:ruler';
    if (t === 'dispatch' || p.includes('dispatch') || t === 'shipping') return 'lucide:truck';

    switch (category) {
        case 'Quality Control':
            return 'lucide:clipboard-check';
        case 'Shipping & Dispatch':
            return 'lucide:truck';
        case 'Lab Operations':
            return 'lucide:flask-conical';
        case 'Accounting & Finance':
            return 'lucide:coins';
        case 'Reports & Analytics':
            return 'lucide:file-bar-chart';
        case 'Order Management':
            return 'lucide:shopping-bag';
        default:
            return 'lucide:wrench';
    }
};

const PlaceholderPage = ({ title: propTitle, message: propMessage, category: propCategory, icon: propIcon }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    // ── Title resolution hierarchy:
    // 1. propTitle (explicit route prop)
    // 2. ?title= query param
    // 3. location.state?.title
    // 4. useParams() (e.g., :processName, :pageName, :moduleName, :id)
    // 5. Last non-empty pathname segment
    const resolveTitle = () => {
        if (propTitle) return propTitle;

        const queryTitle = searchParams.get('title');
        if (queryTitle) return formatSegment(queryTitle);

        if (location.state?.title) return formatSegment(location.state.title);

        const routeParam = params.processName || params.pageName || params.moduleName || params.name || params.id;
        if (routeParam) return formatSegment(routeParam);

        const segments = (location.pathname || '').split('/').filter(Boolean);
        const lastSegment = segments.pop() || 'Module';
        return formatSegment(lastSegment);
    };

    const title = resolveTitle();
    const message = propMessage || searchParams.get('message') || location.state?.message || 'On Customisation';
    const category = propCategory || getCategory(title, location.pathname);
    const iconName = propIcon || searchParams.get('icon') || getIcon(category, title, location.pathname);

    return (
        <div className="flex items-center justify-center min-h-[65vh] p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-xs text-center max-w-lg w-full space-y-5">
                {/* Dynamic Icon */}
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1f618d] flex items-center justify-center mx-auto shadow-inner">
                    <Icon icon={iconName} className="text-2xl text-[#1f618d]" />
                </div>

                {/* Category & Title */}
                <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {category}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                        {title}
                    </h1>
                </div>

                {/* Status Badge */}
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        {message}
                    </span>
                </div>

                {/* Notice text & route path */}
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                    This module is currently undergoing customisation for your manufacturing workflow.
                </p>

                <div className="pt-1">
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        {location.pathname}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate(PATHS.ROOT)}
                        className="px-4 py-2 bg-[#1f618d] hover:bg-[#154360] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaceholderPage;
