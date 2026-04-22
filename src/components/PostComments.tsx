import { useEffect, useRef } from 'react';

interface PostCommentsProps {
  issueTerm: string;
}

export function PostComments({ issueTerm }: PostCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing content
    containerRef.current.innerHTML = '';
    
    // Use a wrapper div so that the script always has a parent, 
    // even if it gets removed from the DOM before executing (React StrictMode).
    // This prevents the 'insertAdjacentHTML' NoModificationAllowedError.
    const wrapper = document.createElement('div');
    
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    
    // IMPORTANT: Ensure the Utterances GitHub app is installed on this repository
    script.setAttribute('repo', 'leewayhertz/blog-comments'); 
    script.setAttribute('issue-term', issueTerm);
    script.setAttribute('label', 'Comment');
    script.setAttribute('theme', 'preferred-color-scheme');
    script.crossOrigin = 'anonymous';
    
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      // Safely unmount by removing the wrapper, but leaving the script inside the detached wrapper
      if (containerRef.current && containerRef.current.contains(wrapper)) {
        containerRef.current.removeChild(wrapper);
      }
    };
  }, [issueTerm]);

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">Comments</h2>
      <div className="bg-card w-full rounded-xl p-4 sm:p-6 border border-border min-h-[200px] flex justify-center">
        {/* Utterances will render its iframe here */}
        <div ref={containerRef} className="w-full max-w-full overflow-hidden [&_.utterances]:max-w-full" />
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Powered by <a href="https://utteranc.es" target="_blank" rel="noreferrer" className="text-primary hover:underline">Utterances</a>. Open source comments backed by GitHub.
      </p>
    </div>
  );
}
