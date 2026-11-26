import { useEffect } from 'react';

/**
 * Hook to lock background scrolling when a modal or overlay is open
 * @param {boolean} isOpen - Whether the modal/overlay is currently open
 */
export const useScrollLock = (isOpen) => {
  useEffect(() => {
    // Only lock scroll if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (isOpen) {
      // Save original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Return cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
    
    // If not open, ensure scroll is enabled (cleanup handles the toggle case automatically, 
    // but this ensures state strictness if isOpen changes largely)
    document.body.style.overflow = '';
    
  }, [isOpen]);
};
