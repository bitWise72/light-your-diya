import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Share2, Copy, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lampId: string;
  shareToken: string;
}

export default function ShareModal({ isOpen, onClose, lampId, shareToken }: ShareModalProps) {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}?lamp=${lampId}&token=${shareToken}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your friends',
    });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `I just lit a diya on Chain of Light! 🪔 Light yours and connect with me: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      `I just lit a diya on Chain of Light! 🪔 Light yours and connect with me:`
    );
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="h-6 w-6 text-primary" />
            <DialogTitle>Share Your Light</DialogTitle>
          </div>
          <DialogDescription>
            Invite those who light up your world and see the globe glow too
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg break-all text-sm">
            {shareUrl}
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={shareWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </Button>
            <Button
              onClick={shareTelegram}
              className="w-full bg-[#0088cc] hover:bg-[#006699] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on Telegram
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
