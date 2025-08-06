'use client';

import React, { useState, useRef } from "react";
import "../css/NavMenu.css";

export default function NavExpand() {
    const [hovered, setHovered] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
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

    return (
        <div
            className={`nav-expand ${hovered ? "expanded" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="nav-icon">
                <div className="hamburger">
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div className="nav-items">
                <ul className="nav-list">
                    <li>Pop</li>
                    <li>J-Pop</li>
                    <li>Other</li>
                    <div className="search-input">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-bar"
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    </div>
                </ul>
            </div>
        </div>
    );
}