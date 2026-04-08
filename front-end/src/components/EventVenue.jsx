import { Flex, Text, Box, Button } from '@radix-ui/themes';
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import './EventVenue.css';

const EventVenue = ({ data }) => {
  if (!data) {
    return (
      <Flex direction="row" justify="center" align="center">
        <Text size="2" mt="2" weight="medium" color="gray">
          No venue information available
        </Text>
      </Flex>
    );
  }

  const venue = data._embedded?.venues[0];

  const venueName = venue.name || 'venue name not available';
  const logoUrl = venue.images?.[0]?.url || '';
  const venueUrl = venue.url || '';

  const streetAddress = venue.address?.line1 || '';
  const city = venue.city?.name || '';
  const state = venue.state?.stateCode || '';
  let googleMapLink = '';
  if (streetAddress && city && state) { 
    googleMapLink = `https://www.google.com/maps/search/?api=1&query=${streetAddress},${city},${state}`
  }

  const parkingDetails = venue.parkingDetail || '';
  const generalRule = venue.generalInfo?.generalRule || '';
  const childRule = venue.generalInfo?.childRule || '';

  const linkToVenue = () => {
    if (venueUrl) {
      return () => window.open(venueUrl, '_blank');
    } else {
      return () => alert('Venue link not available');
    }
  }

  const linkToMaps = () => {
    if (googleMapLink) {
      return () => window.open(googleMapLink, '_blank');
    } else {
      return () => alert('Map link not available');
    }
  }

  return (
    <Flex direction="column">
      <Flex direction={{initial: "column", md: "row"}} justify="between" align={{initial: "start", md: "center"}} gap="4">
        <Flex direction="column">
          <Text size="4" weight="bold">
            {venueName}
          </Text>
          <Box className="back-button" onClick={linkToMaps()}>
            <Text size="2" color="gray" weight="medium">
              {streetAddress}, {city}, {state}
            </Text>
            <ExternalLinkIcon color="grey" />
          </Box>
        </Flex>
        <Flex width={{initial: "100%", md: "auto"}} direction="column" justify="end">
          <Button color="gray" variant="outline" onClick={linkToVenue()}>
            <Text size="1">See Events</Text>
            <ExternalLinkIcon />
          </Button>
        </Flex>
      </Flex>
      <Flex direction={{initial: "column", md: "row"}} align="start" gap="6" mt="6">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Venue Logo"
            className="venue-logo"
          />
        )}
        <Flex direction="column">
          {parkingDetails && (
            <Flex direction="column">
              <Text size="1" color="gray" weight="bold">Parking</Text>
              <Text size="1" weight="medium" mb="4">{parkingDetails}</Text>
            </Flex>
          )}
          {generalRule && (
            <Flex direction="column">
              <Text size="1" color="gray" weight="bold">General Rule</Text>
              <Text size="1" weight="medium" mb="4">{generalRule}</Text>
            </Flex>
          )}
          {childRule && (
            <Flex direction="column">
              <Text size="1" color="gray" weight="bold">Child Rule</Text>
              <Text size="1" weight="medium" mb="4">{childRule}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default EventVenue;