import React, { useState, useRef, useEffect } from 'react';
import { RiSearchLine, RiArrowDownSLine } from 'react-icons/ri';
import { IoCloseSharp } from 'react-icons/io5';

/**
 * SearchableSelect
 *
 * Props:
 *   options           — [{ value, label }]
 *   value             — currently selected value string  (' ' = nothing, '__ALL__' = Select All)
 *   onChange          — fn(value) called on selection
 *   placeholder       — placeholder text when nothing is chosen yet
 *   searchPlaceholder — placeholder inside the search box
 *   allLabel          — label for the "Select All" pinned option (default: "Select All")
 *
 * Special sentinel value:
 *   '__ALL__' — user explicitly chose "Select All" for this field
 *               (hasAnyFilter = true, field filter skipped in filtering logic)
 */
export const SELECT_ALL_VALUE = '__ALL__';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  allLabel = 'Select All',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const filtered = options.filter(
    (opt) => !search || opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const isSelectAll = value === SELECT_ALL_VALUE;
  const selectedLabel = isSelectAll
    ? allLabel
    : options.find((o) => o.value === value)?.label || '';

  const handleSelect = (opt) => {
    // Toggle: clicking the already-selected option deselects it (resets to empty)
    if (opt.value === value) {
      onChange('');
    } else {
      onChange(opt.value);
    }
    setIsOpen(false);
    setSearch('');
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      // Toggle off Select All → clear
      onChange('');
    } else {
      onChange(SELECT_ALL_VALUE);
    }
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const hasValue = Boolean(value); // true for specific value OR '__ALL__'

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-10 flex items-center justify-between px-3 border rounded-lg text-sm bg-white transition shadow-sm
          ${isOpen ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/20' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50/50'}
        `}
      >
        <span className={`truncate text-left flex-1 ${selectedLabel ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {hasValue && (
            <span
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition cursor-pointer"
              title="Clear selection"
            >
              <IoCloseSharp size={14} />
            </span>
          )}
          <RiArrowDownSLine
            size={18}
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
          {/* Search input */}
          <div className="flex items-center px-3 py-2 border-b bg-gray-50/80">
            <RiSearchLine size={14} className="text-orange-500 mr-2 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-gray-400 hover:text-gray-600 rounded p-0.5 ml-1"
              >
                <IoCloseSharp size={13} />
              </button>
            )}
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* Pinned "Select All" row — always visible when not searching */}
            {!search && (
              <li
                onClick={handleSelectAll}
                className={`px-3 py-2 text-xs cursor-pointer transition flex items-center justify-between font-semibold border-b border-gray-100
                  ${isSelectAll
                    ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                    : 'hover:bg-orange-50 text-gray-600 border-l-4 border-transparent'
                  }`}
              >
                <span>⊕ {allLabel}</span>
                {isSelectAll && (
                  <span className="text-orange-600 text-xs font-bold shrink-0 ml-2">✓</span>
                )}
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-gray-400 text-center italic">No matching options</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`px-3 py-2 text-xs cursor-pointer transition flex items-center justify-between
                    ${opt.value === value
                      ? 'bg-orange-50 text-orange-700 font-semibold border-l-4 border-orange-500'
                      : 'hover:bg-orange-50/50 text-gray-700 border-l-4 border-transparent'
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && (
                    <span className="text-orange-600 text-xs font-bold shrink-0 ml-2">✓</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
