import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiChevronDown } from "react-icons/fi"; // dropdown arrow icon

export const CustomDropdown = ({ label, options, value, onChange, name, statusColor, isDisabled }) => {
    const [search, setSearch] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [popupPos, setPopupPos] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef(null);
    const popupRef = useRef(null);

    // Anchor the portalled popup to the trigger using viewport coords.
    const computePos = () => {
        if (!dropdownRef.current) return;
        const rect = dropdownRef.current.getBoundingClientRect();
        setPopupPos({
            top: rect.bottom + 4, // small gap below the trigger
            left: rect.left,
            width: rect.width,
        });
    };

    useLayoutEffect(() => {
        if (!showOptions) return;
        computePos();
        const onScrollOrResize = () => computePos();
        // Capture-phase scroll listener so scrolling INSIDE a modal's scroll container
        // (e.g. the form body) also keeps the popup glued to the trigger.
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, [showOptions]);

    // Close dropdown when clicking outside the trigger AND outside the portalled popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            const insideTrigger = dropdownRef.current?.contains(event.target);
            const insidePopup = popupRef.current?.contains(event.target);
            if (!insideTrigger && !insidePopup) {
                setShowOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredOptions = options.filter(opt =>
        opt?.label?.toLowerCase()?.includes(search.toLowerCase())
    );

    return (
        <div className="relative w-full max-w-md " ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            <div
                onClick={() => {
                    if (!isDisabled) setShowOptions(!showOptions);
                }}
                className={`cursor-pointer p-3 bg-gray-100 rounded-md flex items-center justify-between h-13 overflow-hidden
    ${statusColor} `}
            >
                <span className="truncate w-[90%]">
                    {value ? options.find(o => o.value === value)?.label : `Select ${label || name}`}
                </span>
                {!isDisabled && <FiChevronDown className="ml-2 text-gray-500" />}
            </div>


            {showOptions && createPortal(
                <div
                    ref={popupRef}
                    style={{
                        position: 'fixed',
                        top: popupPos.top,
                        left: popupPos.left,
                        width: popupPos.width,
                        zIndex: 9999, // above any modal backdrop
                    }}
                    className="break-words bg-white shadow rounded-md max-h-56 overflow-y-auto"
                >
                    <input
                        type="text"
                        placeholder={`Search ${label}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border-b outline-none"
                    />
                    {filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                if (option?.isAvail ?? true) {
                                    onChange(option.value);
                                    setShowOptions(false);
                                    setSearch('');
                                }
                            }}
                            className={`px-4 py-2 border-b cursor-pointer ${(option?.isAvail ?? true)
                                    ? 'hover:bg-gray-100'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                        >
                            {option.label}
                        </div>

                    ))}
                    {filteredOptions.length === 0 && (
                        <div className="px-4 py-2 text-gray-500">No matches found</div>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};
