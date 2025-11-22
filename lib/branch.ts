// Branch.io web SDK wrapper
const LANDING_DOMAIN = process.env.NEXT_PUBLIC_LANDING_DOMAIN || 'jikonify.seanmotanya.dev';
const BRANCH_KEY = process.env.NEXT_PUBLIC_BRANCH_KEY;

export const initializeBranch = () => {
  if (typeof window === 'undefined' || !BRANCH_KEY) {
    return null;
  }

  // Branch SDK will be loaded via script tag
  return (window as any).branch;
};

export const attemptAppOpen = async (deepLinkData: any): Promise<boolean> => {
  if (typeof window === 'undefined' || !BRANCH_KEY) {
    return false;
  }

  try {
    const branch = (window as any).branch;
    if (!branch) {
      return false;
    }

    // Try to open app via Branch
    const result = await new Promise<boolean>((resolve) => {
      branch.init(BRANCH_KEY, (err: any, data: any) => {
        if (err) {
          resolve(false);
          return;
        }

        // Try to open app
        branch.link({
          data: deepLinkData,
        }, (err: any, link: any) => {
          if (err) {
            resolve(false);
            return;
          }

          // Attempt to open the app
          window.location.href = link;
          
          // Wait a bit to see if app opens
          setTimeout(() => {
            resolve(false); // Assume app didn't open if we're still here
          }, 2000);
        });
      });
    });

    return result;
  } catch (error) {
    console.error('Error attempting app open:', error);
    return false;
  }
};

export { LANDING_DOMAIN };

