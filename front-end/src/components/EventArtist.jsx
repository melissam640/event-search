import { Flex, Text, Box, Button, Grid, Card, Inset, Heading } from '@radix-ui/themes';
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import './EventArtist.css';

const EventArtist = ({ data, albums }) => {

  const albumsList = Array.isArray(albums) ? albums : (albums?.items ?? albums?.albums ?? []);

  if (!data) {
    return (
      <Flex direction="row" justify="center" align="center">
        <Text size="2" mt="2" weight="medium" color="gray">
          No artist information available
        </Text>
      </Flex>
    );
  }

  const artistImage = data.images[0]?.url || '';
  const artistName = data.name || 'artist name not available';
  const followers = data.followers?.total?.toLocaleString() || 'followers not available';
  const popularity = data.popularity?.toLocaleString()+'%' || 'popularity not available';
  const genres = data.genres?.join(', ') || 'genres not available';

  const linkToArtist = () => {
    if (data.external_urls?.spotify) {
      return () => window.open(data.external_urls.spotify, '_blank');
    } else {
      return () => alert('Artist link not available');
    }
  }

  const linkToAlbum = (album) => {
    if (album.external_urls?.spotify) {
      return () => window.open(album.external_urls.spotify, '_blank');
    } else {
      return () => alert('Album link not available');
    }
  }

  return (
    <Flex direction="column">
      <Flex direction="row" justify="left" align="center" gap="4">
        <img
          src={artistImage}
          alt="Artist Image"
          className="artist-image"
        />
        <Flex direction="column">
          <Text size="4" weight="bold">
            {artistName}
          </Text>
          <Flex direction="row" gap="4">
            <Box as="span">
              <Text color="gray" size="1" weight="medium" mr="1">Followers:</Text>
              <Text color="gray" size="1">{followers}</Text>
            </Box>
            <Box as="span">
              <Text color="gray" size="1" weight="medium" mr="1">Popularity:</Text>
              <Text color="gray" size="1">{popularity}</Text>
            </Box>
          </Flex>
          <Flex direction="row" gap="1">
            <Text color="gray" size="1" weight="medium">Genres:</Text>
            <Text color="gray" size="1">{genres}</Text>
          </Flex>
          <Flex direction="row" mt="2">
            <Button color="gray" variant="solid" highContrast onClick={linkToArtist()}>
              <Text size="1">Open in Spotify</Text>
              <ExternalLinkIcon />
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="row" justify="left" mt="4" mb="4">
        <Text size="3" weight="bold">Albums</Text>
      </Flex>
      <Grid width="100%" columns={{initial: "2", md: "4"}} rows="auto" gap="3">
        {albumsList.map((album) => (
          <Card key={album.id} className="result-card" onClick={linkToAlbum(album)}>
            <Inset clip="padding-box" side="top" pb="current">
              <img
                src={album.images?.[0]?.url || ''}
                alt="Album Image"
                className="album-image"
              />
            </Inset>
            <Flex direction="column" p="1">
              <Heading size="2">
                {album.name || 'Name not available'}
              </Heading>
              <Text size="1" color="gray">
                {album.release_date || ''}
              </Text>
              <Text size="1" color="gray">
                {`${album.total_tracks} tracks` || ''}
              </Text>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
};

export default EventArtist;