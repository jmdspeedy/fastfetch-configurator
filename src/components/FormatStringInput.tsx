import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getFormatPlaceholders, FormatPlaceholder } from '@/data/moduleFormatStrings';

interface FormatStringInputProps {
  /** Current value of the format string input */
  value: string;
  /** Called when the value changes */
  onChange: (value: string) => void;
  /** Module type to look up available format placeholders */
  moduleType: string;
  /** Optional placeholder text for the input */
  placeholder?: string;
}

/**
 * A text input with autocomplete for fastfetch format string placeholders.
 * Shows a dropdown of available placeholders when the user types '{'.
 * Filters suggestions as the user types inside the braces.
 */
export default function FormatStringInput({
  value,
  onChange,
  moduleType,
  placeholder = '{1} {2}',
}: FormatStringInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const braceStartRef = useRef<number>(-1);

  const placeholders = getFormatPlaceholders(moduleType);
  const hasPlaceholders = placeholders.length > 0;

  /**
   * Filter placeholders based on current typed text inside braces.
   */
  const filteredPlaceholders = placeholders.filter((p) =>
    p.placeholder.toLowerCase().includes(filterText.toLowerCase())
  );

  /**
   * Insert a selected placeholder at the cursor position, replacing
   * any partial text typed between the opening '{' and cursor.
   */
  const insertPlaceholder = useCallback(
    (item: FormatPlaceholder) => {
      const start = braceStartRef.current;
      const input = inputRef.current;
      if (start < 0 || !input) return;

      const cursorPos = input.selectionStart || 0;
      const before = value.substring(0, start);
      const after = value.substring(cursorPos);
      const inserted = `{${item.placeholder}}`;
      const newValue = before + inserted + after;

      onChange(newValue);
      setShowDropdown(false);
      setFilterText('');
      braceStartRef.current = -1;

      // Restore cursor position after the inserted placeholder
      const newCursor = before.length + inserted.length;
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(newCursor, newCursor);
      });
    },
    [value, onChange]
  );

  /**
   * Handle input changes and detect the '{' trigger for autocomplete.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);

    if (!hasPlaceholders) return;

    // Walk backwards from cursor to find an unmatched '{'
    let bracePos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (newValue[i] === '}') break;  // Already closed
      if (newValue[i] === '{') {
        bracePos = i;
        break;
      }
    }

    if (bracePos >= 0) {
      braceStartRef.current = bracePos;
      const typed = newValue.substring(bracePos + 1, cursorPos);
      setFilterText(typed);
      setShowDropdown(true);
      setSelectedIndex(0);
    } else {
      setShowDropdown(false);
      setFilterText('');
      braceStartRef.current = -1;
    }
  };

  /**
   * Keyboard navigation within the dropdown (ArrowUp/Down, Enter, Tab, Escape).
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredPlaceholders.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredPlaceholders.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertPlaceholder(filteredPlaceholders[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  /**
   * Close dropdown when clicking outside the input or dropdown.
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Scroll selected item into view within the dropdown.
   */
  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;
    const activeItem = dropdownRef.current.querySelector('[data-active="true"]');
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, showDropdown]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-700 text-gray-200 text-sm font-mono rounded-md p-2 focus:outline-none focus:border-blue-500 placeholder-gray-600"
      />

      {/* Hint for modules with format placeholders */}
      {hasPlaceholders && (
        <p className="text-[10px] text-gray-500 mt-1">
          Type <code className="text-blue-400/80 bg-gray-800 px-1 rounded">{'{'}</code> to see available placeholders for this module.
        </p>
      )}

      {/* Autocomplete dropdown */}
      {showDropdown && filteredPlaceholders.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1a2e] border border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
        >
          {filteredPlaceholders.map((item, index) => (
            <button
              key={item.placeholder}
              data-active={index === selectedIndex}
              className={`w-full text-left px-3 py-1.5 flex items-center gap-3 transition-colors text-sm ${
                index === selectedIndex
                  ? 'bg-blue-600/30 text-blue-200'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                insertPlaceholder(item);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <code className="text-blue-400 font-mono text-xs shrink-0">
                {`{${item.placeholder}}`}
              </code>
              <span className="text-gray-500 text-xs truncate">
                {item.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results hint */}
      {showDropdown && filteredPlaceholders.length === 0 && hasPlaceholders && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1a2e] border border-gray-600 rounded-lg shadow-xl px-3 py-2">
          <span className="text-gray-500 text-xs">No matching placeholders</span>
        </div>
      )}
    </div>
  );
}
