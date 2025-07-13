import { useEffect } from 'react';
import { userManager } from '../user/UserContext';

export function SilentRedirectPage() {
  useEffect(() => {
    userManager.signinSilentCallback()
      .then(() => {
        console.log('Silent sign-in callback completed');
      })
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {/* This page should be hidden */}
    </div>
  );
}
