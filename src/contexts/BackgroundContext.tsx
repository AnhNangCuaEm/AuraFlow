'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  // Default dark violet colors
  const defaultColors = [
    'rgb(30, 10, 60)',   // Dark violet
    'rgb(15, 5, 40)',    // Darker violet
    'rgb(45, 20, 80)'    // Medium violet
  ];
  
  const [colors, setColors] = useState<string[]>(defaultColors);

  const rgbToString = (rgb: [number, number, number]) => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };

  const updateColors = async (imageUrl: string) => {
    try {
      const colorThief = new ColorThief();
      const img = new Image();
      
      // Handle CORS for local images
      if (imageUrl.startsWith('/')) {
        img.crossOrigin = 'anonymous';
      }
      
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            // Wait a bit for the image to be fully loaded
            setTimeout(() => {
              try {
                // Get palette (multiple colors sorted by frequency)
                const palette = colorThief.getPalette(img, 5);
                
                // Function to calculate color brightness
                const getBrightness = (rgb: [number, number, number]) => {
                  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
                };
                
                // Function to calculate color saturation
                const getSaturation = (rgb: [number, number, number]) => {
                  const r = rgb[0] / 255;
                  const g = rgb[1] / 255;
                  const b = rgb[2] / 255;
                  const max = Math.max(r, g, b);
                  const min = Math.min(r, g, b);
                  return max === 0 ? 0 : (max - min) / max;
                };
                
                // Filter out very dark/black colors and very bright/white colors
                const filteredPalette = palette.filter((color: [number, number, number]) => {
                  const brightness = getBrightness(color);
                  const saturation = getSaturation(color);
                  // Keep colors that are not too dark (>30) and not too bright (<200)
                  // And have some saturation (>0.2) to avoid grays
                  return brightness > 30 && brightness < 200 && saturation > 0.2;
                });
                
                // If we have good colors after filtering, use them
                const colorsToUse = filteredPalette.length >= 2 ? filteredPalette : palette;
                
                // Sort by vibrancy (saturation * brightness)
                const sortedByVibrancy = colorsToUse.sort((a: [number, number, number], b: [number, number, number]) => {
                  const vibrancyA = getSaturation(a) * getBrightness(a);
                  const vibrancyB = getSaturation(b) * getBrightness(b);
                  return vibrancyB - vibrancyA; // Descending order
                });
                
                // Convert to RGB strings and darken for better background effect
                const darkenColor = (rgb: [number, number, number], factor: number = 0.7) => {
                  return [
                    Math.round(rgb[0] * factor),
                    Math.round(rgb[1] * factor), 
                    Math.round(rgb[2] * factor)
                  ] as [number, number, number];
                };
                
                // Use the most vibrant colors
                const primaryColor = darkenColor(sortedByVibrancy[0] || palette[0], 0.8);
                const secondaryColor = darkenColor(sortedByVibrancy[1] || palette[1] || sortedByVibrancy[0], 0.7);
                const interactiveColor = darkenColor(sortedByVibrancy[0] || palette[0], 0.5);
                
                // Convert to RGB strings
                const newColors = [
                  rgbToString(primaryColor),
                  rgbToString(secondaryColor),
                  rgbToString(interactiveColor)
                ];
                
                console.log('Original palette:', palette);
                console.log('Filtered palette:', filteredPalette);
                console.log('Final colors:', newColors);
                
                setColors(newColors);
                resolve();
              } catch (colorError) {
                console.error('Error extracting colors:', colorError);
                // Fallback to a nice color scheme based on image
                const fallbackColors = [
                  'rgb(20, 15, 35)',
                  'rgb(35, 25, 55)',
                  'rgb(45, 35, 65)'
                ];
                setColors(fallbackColors);
                resolve();
              }
            }, 100);
          } catch (error) {
            console.error('Error processing image:', error);
            reject(error);
          }
        };
        
        img.onerror = () => {
          console.error('Error loading image for color extraction');
          // Use fallback colors on error
          const fallbackColors = [
            'rgb(20, 15, 35)',
            'rgb(35, 25, 55)', 
            'rgb(45, 35, 65)'
          ];
          setColors(fallbackColors);
          resolve(); // Resolve instead of reject to prevent blocking
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error in updateColors:', error);
      // Use fallback colors
      const fallbackColors = [
        'rgb(20, 15, 35)',
        'rgb(35, 25, 55)',
        'rgb(45, 35, 65)'
      ];
      setColors(fallbackColors);
    }
  };

  const resetToDefault = () => {
    setColors(defaultColors);
  };

  // Update CSS custom properties when colors change
  useEffect(() => {
    const root = document.documentElement;
    if (colors.length >= 2) {
      root.style.setProperty('--color-bg1', colors[0]);
      root.style.setProperty('--color-bg2', colors[1]);
      
      // Extract RGB values for gradient circles
      const extractRGB = (rgbString: string) => {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return match ? `${match[1]}, ${match[2]}, ${match[3]}` : '108, 0, 162';
      };
      
      root.style.setProperty('--color1', extractRGB(colors[0]));
      root.style.setProperty('--color2', extractRGB(colors[1]));
      root.style.setProperty('--color-interactive', extractRGB(colors[2] || colors[0]));
    }
  }, [colors]);

  return (
    <BackgroundContext.Provider value={{ colors, updateColors, resetToDefault }}>
      {children}
    </BackgroundContext.Provider>
  );
};
