import React, { useState, useEffect } from 'react';

const PRESET_COLORS = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'black', 'default'];

interface ColorPickerProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
}

export default function ColorPicker({ label, value = 'default', onChange }: ColorPickerProps) {
    const [inputValue, setInputValue] = useState(value);

    // Sync internal input state when prop value changes (e.g. from preset click)
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-400 font-medium">{label}</label>

            {/* Preset Colors */}
            <div className="flex flex-wrap gap-2 mb-1">
                {PRESET_COLORS.map(c => (
                    <button
                        key={c}
                        onClick={() => onChange(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${value === c ? 'border-white scale-110' : 'border-transparent'
                            }`}
                        style={{
                            backgroundColor: c === 'default' ? '#555' : c === 'magenta' ? '#d04497' : c
                        }}
                        title={c}
                        type="button"
                    />
                ))}
            </div>

            {/* Manual Input */}
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-md px-3 py-2 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. red, 35, bright_blue, #FF0000"
            />
        </div>
    );
}
