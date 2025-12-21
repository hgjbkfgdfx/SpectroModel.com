import React from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Instagram, Youtube, Music as TikTokIcon } from "lucide-react";

export default function ShareButtons({ analysis }) {
  if (!analysis) return null;

  const trackInfo = `${analysis.track_name} by ${analysis.artist_name}`;
  const hitScore = analysis.hit_score ? `${analysis.hit_score.toFixed(1)}%` : "N/A";
  
  const shareText = `Check out my track analysis on SpectroModel! 🎵\n\n"${trackInfo}"\nHit Score: ${hitScore}\n\nAnalyze your music: https://spectromodel.app`;
  const encodedText = encodeURIComponent(shareText);
  const appUrl = encodeURIComponent("https://spectromodel.app");

  const socialLinks = [
    {
      name: "Twitter/X",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
      color: "text-blue-400"
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`,
      color: "text-blue-600"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}&summary=${encodedText}`,
      color: "text-blue-700"
    },
    {
      name: "TikTok",
      icon: TikTokIcon,
      url: `https://www.tiktok.com/upload?description=${encodedText}`,
      color: "text-pink-500"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: `https://www.instagram.com/create/story`,
      color: "text-pink-600"
    }
  ];

  const handleShare = (url) => {
    window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap gap-3">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <Button
            key={social.name}
            variant="outline"
            size="sm"
            onClick={() => handleShare(social.url)}
            className="border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white"
          >
            <Icon className={`w-4 h-4 mr-2 ${social.color}`} />
            Share on {social.name}
          </Button>
        );
      })}
    </div>
  );
}