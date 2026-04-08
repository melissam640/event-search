import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flex, Box, Text, Button, SegmentedControl } from '@radix-ui/themes';
import { ArrowLeftIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import EventInfo from './EventInfo.jsx';
import EventArtist from './EventArtist.jsx';
import EventVenue from './EventVenue.jsx';
import FavButton from './FavButton.jsx';
import './EventDetails.css';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState(null);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (!id) {
      return;
    }
    if (!event) {
      fetch(`/api/event/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch event details');
        return res.json();
      })
      .then((data) => {
        setEvent(data);
      });
    }
    return;
  }, [id]);

  useEffect(() => {
    if (event && !artist && event._embedded?.attractions?.length > 0) {
      const artistName = event._embedded?.attractions[0]?.name || '';
      if (artistName) {
        fetch(`/api/spotify/search?q=${encodeURIComponent(artistName)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch artist details from Spotify');
            return res.json();
        })
        .then((data) => {
          setArtist(data);
        })
      }
    }
    return;
  }, [tab, event]);
  
  useEffect(() => {
    if (!albums && artist) {
      const artistId = artist.id || '';
      fetch(`/api/spotify/albums?q=${encodeURIComponent(artistId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch albums from Spotify');
          return res.json();
      })
      .then((data) => {
        setAlbums(data);
      });
    }
    return;
  }, [artist]);

  if (!event) {
    return (
      <Flex direction="column" gap="3" p="3">
        <Flex direction="row" justify="start">
          <Box className="back-button" onClick={() => navigate('/search')}>
            <ArrowLeftIcon color="grey" />
            <Text size="1" color="gray">
              Back to Search
            </Text>
          </Box>
        </Flex>
        <Flex direction="row" justify="center" align="center">
          <Text size="2" mt="2" weight="medium" color="gray">
            Cannot display event details
          </Text>
        </Flex>
      </Flex>
    );
  }

  let isMusic = false;
  const categories = event.classifications || [];
  for (let i=0; i < categories.length; i++) {
    if (categories[i]?.segment?.name === 'Music') {
      isMusic = true;
      break;
    }
  }

  const handleTabChange = (value) => {
    if (value === 'artist' && !isMusic) { return; }
    setTab(value);
  };

  const linkToTickets = () => {
    if (event.url) {
      return () => window.open(event.url, '_blank');
    } else {
      return () => alert('Ticket link not available');
    }
  }

  return (
    <Flex direction="column" gap="3" p="3">
      <Flex direction="row" justify="start">
        <Box className="back-button" onClick={() => navigate('/search')}>
          <ArrowLeftIcon color="grey" />
          <Text size="1" color="gray">
            Back to Search
          </Text>
        </Box>
      </Flex>
      <Flex direction="row" justify="between" mr="4">
        <Text size="6" weight="bold">{event.name}</Text>
        <Flex direction="row" justify="left" gap="2">
          <Button color="gray" variant="solid" highContrast onClick={linkToTickets()}>
            <Text size="1">Buy Tickets</Text>
            <ExternalLinkIcon />
          </Button>
          <FavButton event={event} />
        </Flex>
      </Flex>
      <SegmentedControl.Root value={tab} onValueChange={handleTabChange} radius="small">
        <SegmentedControl.Item value="info">Info</SegmentedControl.Item>
        <SegmentedControl.Item 
          value="artist"
          className={!isMusic ? "segmented-item--disabled" : ""}
        >
           Artist
        </SegmentedControl.Item>
        <SegmentedControl.Item value="venue">Venue</SegmentedControl.Item>
      </SegmentedControl.Root>
      {tab === 'info' && (<EventInfo data={event} />)}
      {tab === 'artist' && (<EventArtist data={artist} albums={albums} />)}
      {tab === 'venue' && (<EventVenue data={event} />)}
    </Flex>
  );
};

export default EventDetails;