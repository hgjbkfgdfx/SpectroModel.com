import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto bg-slate-900/95 border-purple-500/30 backdrop-blur-sm">
        <div className="p-6 flex flex-col md:flex-row items-center gap-4">
          <Cookie className="w-8 h-8 text-purple-400 flex-shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-semibold mb-2">Cookie Notice</h3>
            <p className="text-slate-300 text-sm">
              We use essential cookies to provide authentication and remember your preferences. 
              We do NOT use tracking cookies for advertising. By continuing, you accept our use of essential cookies.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button
              onClick={declineCookies}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Decline
            </Button>
            <Button
              onClick={acceptCookies}
              className="bg-gradient-to-r from-purple-500 to-blue-500"
            >
              Accept
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}