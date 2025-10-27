import { useEffect } from 'react';
import { getUserManager } from '../user/UserContext';

export function SilentRedirectPage() {
  useEffect(() => {
    getUserManager().signinSilentCallback()
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
