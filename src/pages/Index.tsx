import { useState, useEffect } from 'react';
import MapView from '@/components/MapView';
import CreateLampModal from '@/components/CreateLampModal';
import ShareModal from '@/components/ShareModal';
import { Button } from '@/components/ui/button';
import { Flame, Eye, EyeOff, Sparkles, Share2 } from 'lucide-react';
import { hasCreatedLamp } from '@/lib/fingerprint';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import L from 'leaflet';

const Index = () => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [showLines, setShowLines] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [parentLampId, setParentLampId] = useState<string | null>(null);
  const [currentLampId, setCurrentLampId] = useState<string | null>(null);
  const [currentShareToken, setCurrentShareToken] = useState<string | null>(null);
  const [lampCount, setLampCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lampAlreadyCreated, setLampAlreadyCreated] = useState(() => hasCreatedLamp());
  const { toast } = useToast();

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem('hasVisited');
    if (isFirstVisit) {
      setShowHint(true);
      localStorage.setItem('hasVisited', 'true');
      setTimeout(() => setShowHint(false), 8000);
    }

    if (lampAlreadyCreated) {
      const lampId = localStorage.getItem('myLampId');
      const shareToken = localStorage.getItem('myShareToken');
      if (lampId && shareToken) {
        setCurrentLampId(lampId);
        setCurrentShareToken(shareToken);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const lampId = params.get('lamp');
    const token = params.get('token');

    if (lampId && token) {
      validateAndSetParent(lampId, token);
    }
  }, [map, lampAlreadyCreated]);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('lamps')
        .select('*', { count: 'exact', head: true });
      if (count) setLampCount(count);
    };

    fetchCount();

    const channel = supabase
      .channel('lamp-count-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lamps' }, () => {
        fetchCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const validateAndSetParent = async (lampId: string, token: string) => {
    const { data } = await supabase
      .from('lamps')
      .select('*')
      .eq('id', lampId)
      .eq('share_token', token)
      .single();

    if (data) {
      setParentLampId(lampId);
      const coords = data.coords as { lat: number; lng: number };
      if (map) {
        map.setView([coords.lat, coords.lng], 6);
      }
      toast({
        title: '✨ Connection found!',
        description: 'Light your diya to connect with your friend.',
      });
    }
  };

  const handleLightDiya = () => {
    if (lampAlreadyCreated) {
      toast({
        title: 'Already lit!',
        description: 'You can share your light by inviting friends.',
        variant: 'default',
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCoords(coords);
        setIsCreateModalOpen(true);
        if (map) {
          map.setView([coords.lat, coords.lng], 12);
        }
      },
      () => {
        toast({
          title: 'Location required',
          description: 'Please allow location access to light your diya.',
          variant: 'destructive',
        });
      }
    );
  };

  const handleLampCreated = (lampId: string, shareToken: string) => {
    setCurrentLampId(lampId);
    setCurrentShareToken(shareToken);
    localStorage.setItem('myLampId', lampId);
    localStorage.setItem('myShareToken', shareToken);
    setLampAlreadyCreated(true);
    setIsShareModalOpen(true);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapView onMapReady={setMap} showLines={showLines} />

      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-primary animate-flicker" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent sm:text-2xl">
                Chain of Light
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {lampCount.toLocaleString()} diyas lit worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        <div className="max-w-md mx-auto space-y-3">
          {!lampAlreadyCreated ? (
            <Button
              onClick={handleLightDiya}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold py-6 glow-amber shadow-2xl"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Light Your Diya
            </Button>
          ) : (
            <Button
              onClick={() => setIsShareModalOpen(true)}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-semibold py-6 glow-amber shadow-2xl"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share Your Light with Friends!
            </Button>
          )}

          <Button
            onClick={() => setShowLines(!showLines)}
            variant="outline"
            size="lg"
            className="w-full bg-card/80 backdrop-blur-sm text-lg font-semibold py-6"
          >
            {showLines ? (
              <><EyeOff className="h-5 w-5 mr-2" /> Hide Global Connections</>
            ) : (
              <><Eye className="h-5 w-5 mr-2" /> Show Global Connections</>
            )}
          </Button>

          <a
            href="https://linktr.ee/bitwise72"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full pt-2 text-center text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Made by @bitwise
          </a>
        </div>
      </div>

      {(showHint && !parentLampId) && (
        <div className="absolute top-24 left-0 right-0 z-10 px-4 animate-in fade-in duration-500">
          <div className="max-w-md mx-auto bg-card/80 border border-border rounded-lg p-3 backdrop-blur-sm" onClick={() => setShowHint(false)}>
            <p className="text-sm text-center text-foreground">
              Hint: Zoom in and click on a diya to see what messages people have left for the world!
            </p>
          </div>
        </div>
      )}

      {parentLampId && (
        <div className="absolute top-24 left-0 right-0 z-10 px-4">
          <div className="max-w-md mx-auto bg-primary/20 border border-primary/50 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-center text-primary-foreground">
              A friend invited you! Light your diya to create a connection.
            </p>
          </div>
        </div>
      )}

      <CreateLampModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        coords={userCoords}
        parentLampId={parentLampId}
        onSuccess={handleLampCreated}
      />

      {currentLampId && currentShareToken && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          lampId={currentLampId}
          shareToken={currentShareToken}
        />
      )}
    </div>
  );
};

export default Index;

