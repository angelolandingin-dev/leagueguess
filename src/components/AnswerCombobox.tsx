"use client";

import { useState, useRef, useMemo, useEffect, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AnswerComboboxProps {
  candidates: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  value?: string;
  id?: string;
}

export function AnswerCombobox({
  candidates,
  onSelect,
  placeholder = "Type to search...",
  value: externalValue,
  id,
}: AnswerComboboxProps) {
  const [inputValue, setInputValue] = useState(externalValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return candidates;
    const lower = inputValue.toLowerCase();
    return candidates.filter((c) => c.toLowerCase().includes(lower));
  }, [candidates, inputValue]);

  const visibleCandidates = isOpen && inputValue.length >= 0 ? filtered : [];

  function handleSelect(value: string) {
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(value);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  function handleFocus() {
    setIsOpen(true);
  }

  function handleBlur() {
    const ref = inputRef.current;
    setTimeout(() => {
      if (document.activeElement !== ref) {
        setIsOpen(false);
      }
    }, 200);
  }

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined
        }
        className="w-full"
      />
      {visibleCandidates.length > 0 && (
        <div
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-1 shadow-lg",
            "max-h-[12.5rem] overflow-y-auto"
          )}
        >
          {visibleCandidates.map((candidate, index) => (
            <div
              key={candidate}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              className={cn(
                "cursor-pointer rounded-sm px-3 py-2 text-sm",
                index === highlightedIndex
                  ? "bg-primary text-primary-foreground"
                  : "text-popover-foreground hover:bg-muted"
              )}
              onMouseDown={() => handleSelect(candidate)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {candidate}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
