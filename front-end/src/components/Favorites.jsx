import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Flex, Text, Grid, Card, Inset, Badge, Button, IconButton } from '@radix-ui/themes';
import { HeartIcon, HeartFilledIcon } from '@radix-ui/react-icons';
import { formatDate } from '../utilities/formatDateTime.js';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const isMounted = useRef(false);

  const loadFavorites = useCallback(async () => {
    try {
      const resp = await fetch('/api/favorites');
      if (!resp.ok) {
        console.error('Failed to load favorites', resp.status);
        return;
      }
      const favs = await resp.json();
      if (!isMounted.current) return;
      const arr = favs || [];
      setFavorites(arr);
      setFavoriteIds(new Set(arr.map(f => f.id)));
    } catch (err) {
      console.error('Error loading favorites', err);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    loadFavorites();
    return () => { isMounted.current = false; };
  }, [loadFavorites]);

  const handleFavorite = useCallback(async (fav) => {
    if (!fav || !fav.id) { return; }
    try {
      if (favoriteIds.has(fav.id)) {
        setFavorites(prev => prev.filter(item => item.id !== fav.id));
        const removeResp = await fetch(`/api/favorites/${encodeURIComponent(fav.id)}`, { method: 'DELETE' });
        if (!removeResp.ok) {
          console.error('Failed to remove favorite:', await removeResp.text());
          return;
        } else {
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(fav.id);
            return next;
          });
        }
        toast.error(
          <div>
            <Text weight="bold">{fav.name} removed from favorites!</Text>
          </div>
        , { 
          action: <Button color="gray" highContrast onClick={async () => {
            const addResp = await fetch(`/api/addFavorite/${encodeURIComponent(fav.id)}`, { method: 'POST' });
            if (!addResp.ok) {
              console.error('Failed to add favorite:', await addResp.text());
              return;
            }
            setFavoriteIds(prev => {
              const next = new Set(prev);
              next.add(fav.id);
              return next;
            });
            await loadFavorites();
            toast.success(() => (
            <div>
              <Text weight="bold">{fav.name} re-added to favorites!</Text><br/>
                <Text>You can view it in the Favorites page.</Text>
            </div>
            ));
          }}>Undo</Button>,
        });
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
      await loadFavorites();
    }
  }, [favoriteIds, loadFavorites]);

  if (favorites.length === 0) {
    return (
      <Flex direction="column" mt="5">
        <Text size="6" weight="bold">
          Favorites
        </Text>
        <Flex mt="5" direction="column" justify="center" align="center">
          <Text size="2" mt="2" weight="medium" color="gray">
            No favorite events yet.
          </Text>
          <Text size="2" color="gray">
            Add events to your favorites by clicking the heart icon on any event.
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column" mt="5">
      <Text size="6" weight="bold">
        Favorites
      </Text>
      <Grid columns={{initial: "1", md: "3"}} gap="4" mt="5">
        {favorites.map((fav) => (
            <Card key={fav.id} className="result-card">
              <Inset clip="padding-box" side="top" pb="current" onClick={() => navigate(`/event/${fav.id}`)}>
                <Flex direction="row" justify="between" m="2" className="badge-container">
                  <Badge size="1" variant="solid" radius="large" className="event-badge">
                    {fav.event.classifications?.[0]?.segment?.name || 'Other'}
                  </Badge>
                  <Badge size="1" variant="solid" radius="large" className="event-badge">
                    {formatDate(fav.event.dates?.start?.localDate, fav.event.dates?.start?.localTime)}
                  </Badge>
                </Flex>
                <img 
                  src={fav.event.images?.[0]?.url ?? ''} 
                  alt="Event Image"
                  className="event-image"
                />
              </Inset>
              <Flex direction="row" justify="between" align="center" onClick={() => navigate(`/event/${fav.id}`)}>
                <Flex direction="column">
                  <Text size="2" weight="bold">
                    {fav.name || 'Name not available'}
                  </Text>
                  <Text size="1">
                    {fav.event._embedded?.venues?.[0]?.name || 'Venue not available'}
                  </Text>
                </Flex>
                <IconButton
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); handleFavorite(fav); }}
                  aria-label={favoriteIds.has(fav.id) ? 'Remove favorite' : 'Add favorite'}
                >
                  {favoriteIds.has(fav.id) ? <HeartFilledIcon color="red" /> : <HeartIcon />}
                </IconButton>
              </Flex>
            </Card>
          ))}
      </Grid>
    </Flex>
  )
}

export default Favorites;