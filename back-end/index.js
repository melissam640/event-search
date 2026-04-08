require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());

const clientBuildPath = path.join(__dirname, '..', 'front-end', 'dist');
app.use(express.static(clientBuildPath));

const { MongoClient, ServerApiVersion } = require('mongodb');
const username = encodeURIComponent(process.env.MONGODB_USERNAME);
const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
const uri = `mongodb+srv://${username}:${password}${process.env.MONGODB_BASE_PARAMS}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const database = client.db('favoriteEventsDB');

let GeohashModule = null;

const getGeoPoint = async (location) => {
  if (!GeohashModule) {
    const mod = await import('latlon-geohash');
    GeohashModule = mod.default ? mod.default : mod;
  }
  const Geohash = GeohashModule;
  const url = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = {
    address: location,
    key: process.env.GOOGLE_API_KEY
  }
  geoData = await axios.get(url, { params });
  if (geoData.data.status === 'OK') {
    const lat = geoData.data.results[0].geometry.location.lat;
    const lng = geoData.data.results[0].geometry.location.lng;
    const geoPoint = Geohash.encode(parseFloat(lat), parseFloat(lng), 7);
    return geoPoint;
  } else {
    return '9q5ctrd'; // Default: Los Angeles, CA
  }
};

const segmentId = {
  'all': '',
  'music': 'KZFzniwnSyZfZ7v7nJ',
  'sports': 'KZFzniwnSyZfZ7v7nE',
  'arts&theatre': 'KZFzniwnSyZfZ7v7na',
  'film': 'KZFzniwnSyZfZ7v7nn',
  'miscellaneous': 'KZFzniwnSyZfZ7v7n1'
};

app.get('/api/suggest', async (req, res) => {
  const MAX_SUGGESTIONS = 5;
  const keywords = req.query.keywords || '';
  if (!keywords) return res.json([]);

  const url = `https://app.ticketmaster.com/discovery/v2/suggest`;
  try {
    const resp = await axios.get(url, {
      params: { apikey: process.env.TICKETMASTER_API_KEY, keyword: keywords }
    });

    const data = resp.data;
    const suggestionList = [];

    if (data._embedded?.attractions) {
      data._embedded.attractions.forEach(item => {
        if (item.name) {suggestionList.push(item.name);}
      });
    }
    suggestionList.slice(0, MAX_SUGGESTIONS)
    suggestionList.unshift(keywords);
    res.json(suggestionList);
  } catch (err) {
    console.error('Ticketmaster suggest error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

app.get('/api/search', async (req, res) => {
  const keywords = req.query.keywords || '';
  const category = req.query.category || '';
  const location = req.query.loc || '';
  const distance = req.query.distance || '10';

  const geoPoint = await getGeoPoint(location);

  const url = `https://app.ticketmaster.com/discovery/v2/events.json`;
  try {
    const params = {
      size: 10,
      apikey: process.env.TICKETMASTER_API_KEY,
      keyword: keywords,
      segmentId: segmentId[category] || '',
      radius: distance,
      geoPoint: geoPoint,
      sort: 'date,asc'
    }
    const resp = await axios.get(url, { params });
    const events = resp.data;
    res.json(events);
  } catch (err) {
    console.error('Ticketmaster search error:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/event/:id', async (req, res) => {
  const url = `https://app.ticketmaster.com/discovery/v2/events/${req.params.id}`;
  const params = {
    apikey: process.env.TICKETMASTER_API_KEY
  };
  try {
    const resp = await axios.get(url, { params });
    const eventDetails = resp.data;
    res.json(eventDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

app.get('/api/spotify/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: 'Spotify credentials not configured' });

    const tokenResp = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const token = tokenResp.data.access_token;

    const searchResp = await axios.get('https://api.spotify.com/v1/search', {
      params: { q, type: 'artist', limit: 5 },
      headers: { Authorization: `Bearer ${token}` }
    });
    const artist = searchResp.data.artists?.items[0] || {};
    res.json(artist);
  } catch (err) {
    console.error('Spotify error', err.response?.data || err.message);
    res.status(500).json({ error: 'Spotify search failed' });
  }
});

app.get('/api/spotify/albums', async (req, res) => {
  try {
    const q = req.query.q || '';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) return res.status(500).json({ error: 'Spotify credentials not configured' });

    const tokenResp = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    const token = tokenResp.data.access_token;

    const searchResp = await axios.get(`https://api.spotify.com/v1/artists/${q}/albums`, {
      params: { 
        include_groups: 'album,single,appears_on,compilation',
        market: 'US',
        limit: 10 },
      headers: { Authorization: `Bearer ${token}` }
    });
    const albums = searchResp.data || [];
    res.json(albums);
  } catch (err) {
    console.error('Spotify error', err.response?.data || err.message);
    res.status(500).json({ error: 'Spotify search failed' });
  }
});

app.post('/api/addFavorite/:id', async (req, res) => {
  const reqId = req.params.id;
  if (!reqId) {
    console.error('No event id provided to addFavorite');
    return res.status(400).json({ error: 'Missing event id' });
  }

  try {
    const tmUrl = `https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(reqId)}`;
    const tmResp = await axios.get(tmUrl, { params: { apikey: process.env.TICKETMASTER_API_KEY } });
    const eventDetails = tmResp.data;
    if (!eventDetails || !eventDetails.id) {
      return res.status(404).json({ error: 'Event not found on Ticketmaster' });
    }

    const eventId = eventDetails.id;
    const eventName = eventDetails.name || '';

    await client.connect();
    const favoritesColl = database.collection('favorites');

    try {
      await favoritesColl.createIndex({ id: 1 }, { unique: true });
    } catch (ignore) {}

    const existing = await favoritesColl.findOne({ id: eventId });
    if (existing) {
      return res.status(409).json({ message: 'Event already in favorites', favorite: existing });
    }

    const doc = {
      id: eventId,
      name: eventName,
      event: eventDetails,
      addedAt: new Date()
    };
    await favoritesColl.insertOne(doc);

    return res.status(201).json({ message: 'Event added to favorites', favorite: doc });
  } catch (err) {
    console.error('/api/addFavorite error - full:', err);
    return res.status(500).json({ error: 'Failed to add favorite', details: err.message });
  }
});

app.get('/api/favorites', async (req, res) => {
  try {
    await client.connect();
    const favoritesColl = database.collection('favorites');
    const favorites = await favoritesColl.find({}).sort({ addedAt: -1 }).toArray();
    res.json(favorites);
  } catch (err) {
    console.error('/api/favorites error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.get('/api/favorite/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!eventId) return res.status(400).json({ error: 'Missing event id' });

  try {
    await client.connect();
    const favoritesColl = database.collection('favorites');
    const fav = await favoritesColl.findOne({ id: eventId });
    if (!fav) return res.status(404).json({ error: 'Favorite not found' });
    res.json(fav);
  } catch (err) {
    console.error('/api/favorite error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to fetch favorite' });
  }
});

app.delete('/api/favorites/:id', async (req, res) => {
  const eventId = req.params.id;
  if (!eventId) return res.status(400).json({ error: 'Missing event id' });

  try {
    await client.connect();
    const favoritesColl = database.collection('favorites');
    const result = await favoritesColl.deleteOne({ id: eventId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    return res.json({ message: 'Favorite deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('/api/deleteFavorite error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/')) {
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
  next();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));