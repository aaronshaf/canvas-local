import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

export function useNavigationShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Command (Mac) or Ctrl (Windows/Linux) is pressed
      const isModifierPressed = event.metaKey || event.ctrlKey;

      if (!isModifierPressed) return;

      switch (event.key) {
        case '[':
          // Go back
          event.preventDefault();
          router.history.back();
          break;
        case ']':
          // Go forward
          event.preventDefault();
          router.history.forward();
          break;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);
}
