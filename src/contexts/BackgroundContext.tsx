'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ColorThief from 'colorthief';

interface BackgroundContextType {
  colors: string[];
  updateColors: (imageUrl: string) => Promise<void>;
  resetToDefault: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

interface BackgroundProviderProps {
  children: React.ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  // Default dark violet colors - simple and clean
  const defaultColors = React.useMemo(() => [
    'rgb(30, 10, 60)',   // Dark violet
    'rgb(15, 5, 40)',    // Darker violet
  ], []);
  
  const [colors, setColors] = useState<string[]>(defaultColors);

  const rgbToString = (rgb: [number, number, number]) => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };

  const updateColors = useCallback(async (imageUrl: string) => {
    try {
      const colorThief = new ColorThief();
      const img = new Image();
      
      // Handle CORS for local images
      if (imageUrl.startsWith('/')) {
        img.crossOrigin = 'anonymous';
      }
      
      return new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            // Simple and fast - just get dominant colors
            setTimeout(() => {
              try {
                const palette = colorThief.getPalette(img, 2); // Only 2 colors for performance
                
                // Simple darken function
                const darkenColor = (rgb: [number, number, number], factor: number = 0.6) => {
                  return [
                    Math.round(rgb[0] * factor),
                    Math.round(rgb[1] * factor), 
                    Math.round(rgb[2] * factor)
                  ] as [number, number, number];
                };
                
                const color1 = darkenColor(palette[0] || [30, 10, 60], 0.7);
                const color2 = darkenColor(palette[1] || [15, 5, 40], 0.5);
                
                const newColors = [
                  rgbToString(color1),
                  rgbToString(color2)
                ];
                
                setColors(newColors);
                resolve();
              } catch (colorError) {
                console.error('Error extracting colors:', colorError);
                setColors(defaultColors);
                resolve();
              }
            }, 50); // Fast timeout
          } catch (error) {
            console.error('Error processing image:', error);
            setColors(defaultColors);
            resolve();
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image for color extraction');
          setColors(defaultColors);
          resolve();
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in updateColors:', error);
      setColors(defaultColors);
    }
  }, [defaultColors]);

  const resetToDefault = useCallback(() => {
    setColors(defaultColors);
  }, [defaultColors]);

  // Update CSS custom properties when colors change
  useEffect(() => {
    const root = document.documentElement;
    if (colors.length >= 2) {
      root.style.setProperty('--color-bg1', colors[0]);
      root.style.setProperty('--color-bg2', colors[1]);
    }
  }, [colors]);

  return (
    <BackgroundContext.Provider value={{ colors, updateColors, resetToDefault }}>
      {children}
    </BackgroundContext.Provider>
  );
};
