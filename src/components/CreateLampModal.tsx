import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint, markLampCreated } from '@/lib/fingerprint';
import { useToast } from '@/hooks/use-toast';
import { Flame } from 'lucide-react';

interface CreateLampModalProps {
  isOpen: boolean;
  onClose: () => void;
  coords: { lat: number; lng: number } | null;
  parentLampId?: string | null;
  onSuccess: (lampId: string, shareToken: string) => void;
}

export default function CreateLampModal({
  isOpen,
  onClose,
  coords,
  parentLampId,
  onSuccess,
}: CreateLampModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!coords || !message.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please add your heartfelt message',
        variant: 'destructive',
      });
      return;
    }

    if (message.length > 280) {
      toast({
        title: 'Message too long',
        description: 'Please keep your message under 280 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const fingerprint = await getDeviceFingerprint();

      // Get user's IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Check if IP already has a lamp
      const { data: existingLamps } = await supabase
        .from('lamps')
        .select('id')
        .eq('ip_address', ip)
        .limit(1);

      if (existingLamps && existingLamps.length > 0) {
        toast({
          title: 'Already lit!',
          description: 'This location has already lit a diya. Share your light with others!',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Create lamp
      const { data: lamp, error: lampError } = await supabase
        .from('lamps')
        .insert({
          coords,
          message: message.trim(),
          parent_lamp_id: parentLampId,
          device_fingerprint: fingerprint,
          ip_address: ip,
        })
        .select()
        .single();

      if (lampError) throw lampError;

      // Create edge if parent exists
      if (parentLampId && lamp) {
        const { error: edgeError } = await supabase
          .from('edges')
          .insert({
            parent_lamp_id: parentLampId,
            child_lamp_id: lamp.id,
          });

        if (edgeError) console.error('Edge creation error:', edgeError);
      }

      markLampCreated();
      onSuccess(lamp.id, lamp.share_token);
      onClose();

      toast({
        title: '✨ Diya lit successfully!',
        description: 'Your light has joined the global chain',
      });
    } catch (error) {
      console.error('Error creating lamp:', error);
      toast({
        title: 'Error',
        description: 'Failed to light your diya. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-6 w-6 text-primary animate-flicker" />
            <DialogTitle>Light Your Diya</DialogTitle>
          </div>
          <DialogDescription>
            Share your heartfelt message with the world and maybe with person who shared their light with you (anonymously).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Wishing you and all your family members a super Happy Diwali..."
            className="min-h-[120px] resize-none"
            maxLength={280}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/280 characters
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-amber"
          >
            {loading ? 'Lighting...' : '✨ Light Diya'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
