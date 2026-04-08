import { useNavigate } from 'react-router-dom';
import { Flex, Text, Grid, Card, Inset, Badge } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { formatDate } from '../utilities/formatDateTime.js';
import FavButton from './FavButton.jsx';

const Results = ({ data }) => {
  const navigate = useNavigate();
  const events = data?._embedded?.events ?? [];

  if (!data) {
    return (
      <Flex width="100%" mt="5" direction="column" justify="center" align="center">
        <MagnifyingGlassIcon width="40" height="40" color="gray"/>
        <Text size="2" mt="2" weight="medium" align="center" color="gray">
          Enter search criteria and click the Search button to find events.
        </Text>
      </Flex>
    )
  }

  if (events.length === 0) {
    return (
      <Flex width="100%" mt="5" direction="column" justify="center" align="center">
        <MagnifyingGlassIcon width="40" height="40" color="gray"/>
        <Text size="4" mt="2" weight="medium" align="center" color="gray">
          Nothing found
        </Text>
        <Text size="2" weight="medium" align="center" color="gray">
          Update the query to find events near you.
        </Text>
      </Flex>
    )
  }

  return (
    <Grid width="100%" columns={{initial: "1", md: "3"}} rows="auto" gap="3">
      {events.map((event) => (
        <Card key={event.id} className="result-card">
          <Inset clip="padding-box" side="top" pb="current" onClick={() => navigate(`/event/${event.id}`)}>
            <Flex direction="row" justify="between" m="2" className="badge-container">
              <Badge size="1" variant="solid" radius="large" className="event-badge">
                {event.classifications?.[0]?.segment?.name || 'Other'}
              </Badge>
              <Badge size="1" variant="solid" radius="large" className="event-badge">
                {formatDate(event.dates?.start?.localDate, event.dates?.start?.localTime)}
              </Badge>
            </Flex>
            <img
              src={event.images?.[0]?.url || ''}
              alt="Event Image"
              className="event-image"
            />
          </Inset>
          <Flex direction="row" justify="between" align="center" onClick={() => navigate(`/event/${event.id}`)}>
            <Flex direction="column">
              <Text size="2" weight="bold">
                {event.name || 'Name not available'}
              </Text>
              <Text size="1">
                {event._embedded?.venues?.[0]?.name || 'Venue not available'}
              </Text>
            </Flex>
            <FavButton event={event} />
          </Flex>
        </Card>
      ))}
    </Grid>
  );
}

export default Results;