import React, { useEffect, useState } from "react";

interface OrientationGateProps {
  children: React.ReactNode;
}

// Blocks interaction when device is in portrait. Shows full-screen overlay asking to rotate.
const OrientationGate: React.FC<OrientationGateProps> = ({ children }) => {
  const computeIsLandscape = (): boolean => {
    const g = globalThis as unknown as {
      matchMedia?: (query: string) => MediaQueryList;
      innerWidth?: number;
      innerHeight?: number;
    };
    if (g.matchMedia) {
      return g.matchMedia("(orientation: landscape)").matches;
    }
    if (typeof g.innerWidth === "number" && typeof g.innerHeight === "number") {
      return g.innerWidth >= g.innerHeight;
    }
    return true;
  };

  const [isLandscape, setIsLandscape] = useState<boolean>(computeIsLandscape());

  useEffect(() => {
    const onChange = () => setIsLandscape(computeIsLandscape());
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {children}
      {!isLandscape && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-sky-300 via-green-200 to-green-300"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Rotate device"
        >
          <div className="px-6 text-center">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 shadow-lg rounded-2xl bg-white/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-10 h-10 size-6 text-amber-800"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </div>
            <div className="inline-block px-6 py-3 text-lg font-bold text-white bg-orange-500 rounded-full shadow">
              Putar perangkat ke mode landscape untuk bermain
            </div>
            <p className="mt-3 font-semibold text-amber-800">
              Silakan rotasi layar Anda ke posisi horizontal
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrientationGate;
