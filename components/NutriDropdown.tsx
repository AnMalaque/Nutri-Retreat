'use client';

import React, { useState, useRef, useEffect, FC } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface NutriDropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
}

const NutriDropdown: FC<NutriDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ top: 0, left: 0, width: 0, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        // Also check if click is inside the portal menu
        const menu = document.getElementById('nutri-dropdown-portal-menu');
        if (menu && menu.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // ── Reposition on scroll / resize while open ─────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const update = () => calcPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  const calcPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuMaxH = 340;
    const openUp = spaceBelow < menuMaxH && spaceAbove > spaceBelow;
    setMenuPos({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) calcPosition();
    setIsOpen(prev => !prev);
  };

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(); }
    if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); }
  };

  return (
    <div className={`nutri-dropdown-wrapper ${className}`}>
      {label && <label htmlFor={id} className="fusion-label">{label}</label>}

      {/* ── Trigger ───────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        id={id}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`nutri-dropdown-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        type="button"
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`chevron-icon ${isOpen ? 'rotated' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* ── Portal Menu (fixed positioning escapes overflow:hidden) ───────── */}
      {isOpen && !disabled && typeof document !== 'undefined' && (
        <div
          id="nutri-dropdown-portal-menu"
          className={`nutri-dropdown-menu ${menuPos.openUp ? 'open-up' : ''}`}
          role="listbox"
          aria-label={`${label || 'Select'} options`}
          style={{
            position: 'fixed',
            top: menuPos.openUp ? undefined : menuPos.top,
            bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
            left: menuPos.left,
            width: menuPos.width,
          }}
        >
          {options.length === 0 ? (
            <div className="dropdown-empty">No options available</div>
          ) : (
            options.map((option, index) => (
              <button
                key={option.value}
                className={`dropdown-option ${value === option.value ? 'selected' : ''} ${hoveredIndex === index ? 'hovered' : ''} ${option.disabled ? 'disabled' : ''}`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                role="option"
                aria-selected={value === option.value}
                disabled={option.disabled}
                type="button"
              >
                <div className="option-content">
                  <span className="option-label">{option.label}</span>
                  {option.description && (
                    <span className="option-description">{option.description}</span>
                  )}
                </div>
                {value === option.value && (
                  <span className="checkmark" aria-hidden="true">✓</span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .nutri-dropdown-wrapper {
          width: 100%;
        }

        /* ── TRIGGER ─────────────────────────────────────────────────────── */
        .nutri-dropdown-trigger {
          width: 100%;
          padding: 9px 12px;
          background: var(--bg, rgba(246, 247, 221, 0.55));
          border: 1.5px solid var(--border, rgba(222, 207, 172, 0.70));
          border-radius: 10px;
          font-size: 13px;
          font-family: inherit;
          color: var(--text, #4A3728);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          outline: none;
          box-sizing: border-box;
        }

        .nutri-dropdown-trigger:hover:not(:disabled) {
          border-color: rgba(201, 173, 127, 0.85);
        }

        .nutri-dropdown-trigger:focus,
        .nutri-dropdown-trigger.active {
          border-color: #C9AD7F;
          box-shadow: 0 0 0 3px rgba(201, 173, 127, 0.20);
        }

        .nutri-dropdown-trigger.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .selected-text {
          font-weight: 500;
          color: var(--text, #4A3728);
          font-size: 13px;
        }

        .placeholder-text {
          color: var(--text-muted, #A67C5B);
          font-size: 13px;
        }

        .chevron-icon {
          flex-shrink: 0;
          color: var(--text-muted, #A67C5B);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chevron-icon.rotated { transform: rotate(180deg); }

        /* ── MENU (fixed, z-index high) ──────────────────────────────────── */
        .nutri-dropdown-menu {
          background: rgba(246, 247, 221, 0.97);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1.5px solid rgba(222, 207, 172, 0.70);
          border-radius: 12px;
          box-shadow:
            0 8px 32px rgba(166, 124, 91, 0.18),
            0 2px 8px rgba(201, 173, 127, 0.12);
          overflow-y: auto;
          z-index: 99999;
          max-height: 340px;
          animation: ndSlideDown 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nutri-dropdown-menu.open-up {
          animation: ndSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes ndSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ndSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── OPTIONS ─────────────────────────────────────────────────────── */
        .dropdown-option {
          width: 100%;
          padding: 10px 14px;
          border: none;
          border-bottom: 1px solid rgba(222, 207, 172, 0.35);
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          color: #4A3728;
          text-align: left;
          transition: background 0.12s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-sizing: border-box;
        }
        .dropdown-option:last-child { border-bottom: none; }

        .dropdown-option:hover:not(.selected):not(.disabled),
        .dropdown-option.hovered:not(.disabled) {
          background: rgba(201, 173, 127, 0.12);
        }
        .dropdown-option.selected { background: rgba(201, 173, 127, 0.20); }
        .dropdown-option.disabled { opacity: 0.5; cursor: not-allowed; }

        .option-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .option-label  { font-weight: 500; color: #4A3728; }
        .option-description { font-size: 11.5px; color: #7A6045; opacity: 0.75; }
        .checkmark { flex-shrink: 0; color: #C9AD7F; font-weight: 700; font-size: 15px; }

        .dropdown-empty {
          padding: 20px 16px;
          text-align: center;
          color: #A67C5B;
          font-size: 13px;
        }

        /* ── SCROLLBAR ───────────────────────────────────────────────────── */
        .nutri-dropdown-menu::-webkit-scrollbar       { width: 5px; }
        .nutri-dropdown-menu::-webkit-scrollbar-track { background: transparent; }
        .nutri-dropdown-menu::-webkit-scrollbar-thumb {
          background: rgba(201, 173, 127, 0.30);
          border-radius: 10px;
        }
        .nutri-dropdown-menu::-webkit-scrollbar-thumb:hover { background: #C9AD7F; }

        @media (prefers-reduced-motion: reduce) {
          .chevron-icon, .nutri-dropdown-menu { animation: none; transition: none; }
        }
      `}</style>
    </div>
  );
};

export default NutriDropdown;