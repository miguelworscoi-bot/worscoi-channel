import React, { createContext, useContext, useState, useEffect, ReactNode, MouseEvent } from 'react';

interface RouterContextType {
  pathname: string;
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
  forward: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const AppRouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        return hash.slice(1);
      }
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/')) {
        setPathname(hash.slice(1));
      } else {
        setPathname(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = (href: string) => {
    const cleanHref = href.startsWith('/') ? href : `/${href}`;
    setPathname(cleanHref);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', cleanHref);
      } catch {
        window.location.hash = `#${cleanHref}`;
      }
    }
  };

  const replace = (href: string) => {
    const cleanHref = href.startsWith('/') ? href : `/${href}`;
    setPathname(cleanHref);
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({}, '', cleanHref);
      } catch {
        window.location.hash = `#${cleanHref}`;
      }
    }
  };

  const back = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const forward = () => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  };

  return (
    <RouterContext.Provider value={{ pathname, push, replace, back, forward }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within AppRouterProvider');
  }
  return context;
}

export function usePathname(): string {
  const context = useContext(RouterContext);
  return context ? context.pathname : '/';
}

export function useSearchParams(): URLSearchParams {
  if (typeof window !== 'undefined') {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, onClick, ...rest }) => {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !href.startsWith('http')) {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  );
};
