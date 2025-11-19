'use client';

import { Share2, MessageCircle, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
}

export function SocialShare({ url, title, description, hashtags = [] }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const hashtagString = hashtags.join(',');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtags.length > 0 ? `&hashtags=${hashtagString}` : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async (platform: string) => {
    // Track share event (can add analytics here)
    console.log(`Shared to ${platform}:`, { url, title });
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Share menu */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Share this page</p>
            </div>

            <div className="p-2">
              {/* Twitter */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-black rounded-lg">
                  <Twitter className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Share on X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Share on Facebook</span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('whatsapp')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Share on WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-700 rounded-lg">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Share on LinkedIn</span>
              </a>

              {/* Copy link */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {copied ? 'Link copied!' : 'Copy link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
