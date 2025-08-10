'use client';

import React, { useState, useRef } from "react";
import "../css/NavMenu.css";

interface NavMenuProps {
    onGenreFilter: (genre: string | null) => void;
    onSearch: (searchTerm: string) => void;
    activeGenre: string | null;
}

export default function NavExpand({ onGenreFilter, onSearch, activeGenre }: NavMenuProps) {
    const [hovered, setHovered] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setHovered(true);
    };

    const handleMouseLeave = () => {
        // Don't hide if input is focused
        if (inputFocused) return;

        timeoutRef.current = setTimeout(() => {
            setHovered(false);
        }, 2000);
    };

    const handleInputFocus = () => {
        setInputFocused(true);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setHovered(true);
    };

    const handleInputBlur = () => {
        setInputFocused(false);
        setTimeout(() => {
            timeoutRef.current = setTimeout(() => {
                setHovered(false);
            }, 2000);
        }, 0);
    };

    const handleGenreClick = (genre: string) => {
        if (activeGenre === genre) {
            // If clicking the same genre, deselect it
            onGenreFilter(null);
        } else {
            // Select new genre
            onGenreFilter(genre);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <div
            className={`nav-expand ${hovered ? "expanded" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="nav-icon">
                <div className="hamburger">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>
            </div>
            <div className="nav-items">
                <ul className="nav-list">
                    <li 
                        className={activeGenre === "Pop" ? "active" : ""}
                        onClick={() => handleGenreClick("Pop")}
                    >
                        Pop
                    </li>
                    <li 
                        className={activeGenre === "J-Pop" ? "active" : ""}
                        onClick={() => handleGenreClick("J-Pop")}
                    >
                        J-Pop
                    </li>
                    <li 
                        className={activeGenre === "Other" ? "active" : ""}
                        onClick={() => handleGenreClick("Other")}
                    >
                        その他
                    </li>
                    <div className="search-input">
                        <input
                            type="text"
                            placeholder="検索..."
                            className="search-bar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>
                </ul>
            </div>
        </div>
    );
}