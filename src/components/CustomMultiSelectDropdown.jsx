import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export const CustomMultiSelectDropdown = ({ label, options = [], value = [], onChange, name, isDisabled }) => {
    const [search, setSearch] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const popupRef = useRef(null);

    // Normalize value → array of strings
    const selectedValues = (() => {
        if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
        if (typeof value === 'string' && value.trim()) return value.split(',').map(v => v.trim()).filter(Boolean);
        return [];
    })();

    const computePos = () => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        setPopupPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };

    useLayoutEffect(() => {
        if (!showOptions) return;
        computePos();
        window.addEventListener("scroll", computePos, true);
        window.addEventListener("resize", computePos);
        return () => {
            window.removeEventListener("scroll", computePos, true);
            window.removeEventListener("resize", computePos);
        };
    }, [showOptions]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!dropdownRef.current?.contains(e.target) && !popupRef.current?.contains(e.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (val) => {
        const valStr = String(val);
        if (valStr === 'all') {
            onChange(selectedValues.includes('all') ? [] : ['all']);
            return;
        }
        // Remove 'all' if a specific plant is chosen
        let next = selectedValues.filter(v => v !== 'all');
        if (next.includes(valStr)) {
            next = next.filter(v => v !== valStr);
        } else {
            next = [...next, valStr];
        }
        onChange(next);
    };

    const filteredOptions = options.filter(opt =>
        opt?.label?.toLowerCase().includes(search.toLowerCase())
    );

    const displayText = (() => {
        if (!selectedValues.length) return `Select ${label || name || 'Plant'}`;
        if (selectedValues.includes('all')) return 'ALL Plant';
        const labels = options
            .filter(o => selectedValues.includes(String(o.value)))
            .map(o => o.label);
        return labels.length ? labels.join(', ') : selectedValues.join(', ');
    })();

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div
                onClick={() => { if (!isDisabled) setShowOptions(prev => !prev); }}
                className={`cursor-pointer p-3 bg-gray-100 rounded-md flex items-center justify-between min-h-[48px] ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200'} transition-colors`}
            >
                <span className={`truncate text-sm mr-2 ${selectedValues.length ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    {displayText}
                </span>
                {!isDisabled && (
                    showOptions
                        ? <FiChevronUp className="flex-shrink-0 text-gray-500" />
                        : <FiChevronDown className="flex-shrink-0 text-gray-500" />
                )}
            </div>

            {selectedValues.length > 0 && !selectedValues.includes('all') && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {selectedValues.map(v => {
                        const opt = options.find(o => String(o.value) === v);
                        return (
                            <span
                                key={v}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                            >
                                {opt ? opt.label : v}
                                {!isDisabled && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleOption(v); }}
                                        className="hover:text-red-600 font-bold leading-none"
                                    >
                                        ×
                                    </button>
                                )}
                            </span>
                        );
                    })}
                </div>
            )}

            {showOptions && createPortal(
                <div
                    ref={popupRef}
                    style={{ position: 'fixed', top: popupPos.top, left: popupPos.left, width: Math.max(popupPos.width, 280), zIndex: 9999 }}
                    className="bg-white shadow-2xl rounded-md border border-gray-200 max-h-64 flex flex-col"
                >
                    <div className="p-2 border-b bg-white sticky top-0">
                        <input
                            type="text"
                            placeholder={`Search ${label}...`}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            autoFocus
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 && (
                            <div className="px-4 py-3 text-gray-400 text-sm text-center">No results found</div>
                        )}
                        {filteredOptions.map(option => {
                            const isSelected = selectedValues.includes(String(option.value));
                            return (
                                <div
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 text-sm transition-colors
                                        ${isSelected ? 'bg-orange-50 text-orange-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                        className="w-4 h-4 rounded border-gray-300 text-orange-500 pointer-events-none accent-orange-500 flex-shrink-0"
                                    />
                                    <span className="flex-1">{option.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {selectedValues.length > 0 && (
                        <div className="p-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                            <span>{selectedValues.includes('all') ? 'All plants selected' : `${selectedValues.length} plant(s) selected`}</span>
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                className="text-red-500 hover:text-red-700 font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};
