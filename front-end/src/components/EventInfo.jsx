import { Flex, Text, Grid, Badge, IconButton } from '@radix-ui/themes';
import { TwitterLogoIcon } from '@radix-ui/react-icons';
import { SlSocialFacebook } from "react-icons/sl";
import { formatDate } from '../utilities/formatDateTime.js';
import './EventInfo.css';

const ticketStatusMessage = {
  'onsale': 'On Sale',
  'offsale': 'Off Sale',
  'canceled': 'Canceled',
  'postponed': 'Postponed',
  'rescheduled': 'Rescheduled'
}

const ticketStatusColor = {
  'onsale': 'green',
  'offsale': 'red',
  'canceled': 'gray',
  'postponed': 'orange',
  'rescheduled': 'orange'
}

const getAllArtists = (data) => {
  let artistSection = '';

  const numArtists = data._embedded?.attractions?.length || 0;
  if (numArtists === 0) {
    artistSection += 'artist not available';
  } else {
    artistSection += `${data._embedded.attractions[0].name ?? 'artist not available'}`;
    for (let i=1; i < (numArtists); i++) {
      if (data._embedded.attractions[i]?.name){
        artistSection += `, ${data._embedded.attractions[i].name}`;
      }
    }
  }
return artistSection;
}

const getAllGenres = (data) => {
  let genreSection = '';
  const numGenres = data.classifications?.length || 0;

  if (numGenres === 0) {
    genreSection += 'genre not available';
  } else {
    genreSection += `${data.classifications[0]?.genre?.name ?? 'genre not available'}`;
    for (let i=1; i < (numGenres); i++) {
      if (data.classifications[i]?.genre?.name) {
        genreSection += `, ${data.classifications[i].genre.name}`;
      }
    }
  }
return genreSection;
}

const EventInfo = ({ data }) => {
  if (!data) {
    return (
      <Flex direction="row" justify="center" align="center">
        <Text size="2" mt="2" weight="medium" color="gray">
          No event information available
        </Text>
      </Flex>
    );
  }

  const localDate = data.dates?.start?.localDate ?? 'date not available';
  const localTime = data.dates?.start?.localTime ?? 'time not available';
  const dateTime = formatDate(localDate, localTime);

  const artistSection = getAllArtists(data);
  const venueName = data._embedded?.venues[0]?.name ?? 'venue name not available';
  const genreSection = getAllGenres(data);

  const ticket = data.dates?.status?.code ?? 'status not available';
  const ticketStatus = ticketStatusMessage[ticket] || ticket;
  const ticketColor = ticketStatusColor[ticket] || 'gray';
  // if the ticket badge is black, use Radix highContrast prop
  let isBlack = false;
  if (ticket === 'canceled') { isBlack = true; }
  
  const seatMapImage = data.seatmap?.staticUrl || '';

  const openFacebookShare = () => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`;
    return () => window.open(facebookShareUrl, '_blank');
  }

  const openTwitterShare = () => {
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check ' + data.name)}&url=${encodeURIComponent(data.url)}`;
    return () => window.open(twitterShareUrl, '_blank');
  }
  
  return (
    <Grid width="100%" columns={{initial: "1", md: "2"}} rows="auto">
      <Flex direction="column">
        <Text size="1" color="gray" mt="2" weight="bold">Date</Text>
        <Text size="1" mb="2" weight="medium">
          {dateTime}
        </Text>

        <Text size="1" color="gray" mt="2" weight="bold">Artist/Team</Text>
        <Text size="1" mb="2" weight="medium">{artistSection}</Text>

        <Text size="1" color="gray" mt="2" weight="bold">Venue</Text>
        <Text size="1" mb="2" weight="medium">{venueName}</Text>

        <Text size="1" color="gray" mt="2" weight="bold">Genres</Text>
        <Text size="1" mb="2" weight="medium">{genreSection}</Text>

        <Text size="1" color="gray" mt="2" weight="bold">Ticket Status</Text>
        <Flex>
          <Badge variant="solid" color={ticketColor} highContrast={isBlack}>{ticketStatus}</Badge>
        </Flex>

        <Text size="1" color="gray" mt="2" weight="bold">Share</Text>
        <Flex direction="row" gap="2" mt="1">
          <IconButton color="gray" variant="outline" onClick={openFacebookShare()}>
            <SlSocialFacebook />
          </IconButton>
          <IconButton color="gray" variant="outline" onClick={openTwitterShare()}>
            <TwitterLogoIcon />
          </IconButton>
        </Flex>
        
      </Flex>
      <Flex direction="column">
        <Text size="1" color="gray" mt="2" mb="2" weight="bold">Seatmap</Text>
        {seatMapImage && <img className="seatmap-image" src={seatMapImage} alt="venue map" />}
      </Flex>
    </Grid>
  );
};

export default EventInfo;