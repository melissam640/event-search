import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { IconButton, Text, Button } from '@radix-ui/themes';
import { HeartIcon, HeartFilledIcon } from '@radix-ui/react-icons';

const FavButton = ({ event }) => {
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    const loadFavorites = async () => {
      try {
        const resp = await fetch('/api/favorites');
        if (!resp.ok) return;
        const favs = await resp.json();
        if (!mounted) return;
        setFavoriteIds(new Set((favs || []).map(f => f.id)));
      } catch (err) {
        console.error('Error loading favorites', err);
      }
    };
    loadFavorites();
    return () => { mounted = false; };
  }, []);

  const isFav = !!event && favoriteIds.has(event.id);

  const handleFavorite = useCallback(async (evt) => {
    try {
      if (!event || !event.id) {
        console.warn('No event id available for favorite');
        return;
      }
      if (isFav) {
        const removeResp = await fetch(`/api/favorites/${encodeURIComponent(event.id)}`, { method: 'DELETE' });
        if (!removeResp.ok) {
          console.error('Failed to remove favorite:', await removeResp.text());
          return;
        }
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.delete(event.id);
          return next;
        });
        toast.error(
          <div>
            <Text weight="bold">{event.name} removed from favorites!</Text>
          </div>
        , { 
          action: <Button color="gray" highContrast onClick={async () => {
            const addResp = await fetch(`/api/addFavorite/${encodeURIComponent(event.id)}`, { method: 'POST' });
            if (!addResp.ok) {
              console.error('Failed to add favorite:', await addResp.text());
              return;
            }
            setFavoriteIds(prev => {
              const next = new Set(prev);
              next.add(event.id);
              return next;
            });
            toast.success(() => (
            <div>
              <Text weight="bold">{event.name} re-added to favorites!</Text><br/>
                <Text>You can view it in the Favorites page.</Text>
            </div>
            ));
          }}>Undo</Button>,
        });
      } else {
        const addResp = await fetch(`/api/addFavorite/${encodeURIComponent(event.id)}`, { method: 'POST' });
        if (!addResp.ok) {
          console.error('Failed to add favorite:', await addResp.text());
          return;
        }
        setFavoriteIds(prev => {
          const next = new Set(prev);
          next.add(event.id);
          return next;
        });
        toast.success(() => (
          <div>
            <Text weight="bold">{event.name} added to favorites!</Text><br/>
            <Text>You can view it in the Favorites page.</Text>
          </div>
        ));
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
    }
  }, [event, isFav]);

  return (
    <IconButton
      variant="outline"
      onClick={(e) => { e.stopPropagation(); handleFavorite(e); }}
      aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
    >
      {isFav ? <HeartFilledIcon color="red" /> : <HeartIcon />}
    </IconButton>
  );
};

export default FavButton;