import { useState, useCallback } from 'react';
import { Flex, Button, Text } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Keyword from './Keyword.jsx';
import Category from './Category.jsx';
import Location from './Location.jsx';
import Distance from './Distance.jsx';
import Results from './Results.jsx';
import './Search.css';

const token = import.meta.env.VITE_IPINFO_TOKEN;
const findLocation = async () => {
  return fetch(`https://ipinfo.io/json?token=${token}`)
    .then((response) => response.json())
    .then((jsonResponse) => {
      return jsonResponse.city + ', ' + jsonResponse.region;
    });
};

const Search = () => {
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [autoLocation, setAutoLocation] = useState(false);
  const [distance, setDistance] = useState('10');
  const [results, setResults] = useState('');

  const [errors, setErrors] = useState({
    keyword: { invalid: false, message: '' },
    location: { invalid: false, message: '' },
    distance: { invalid: false, message: '' }
  });

  const handleInvalidInput = () => {
    const next = {
      keyword: { invalid: false, message: '' },
      location: { invalid: false, message: '' },
      distance: { invalid: false, message: '' }
    };

    // Keyword required
    if (!keywords || keywords.trim() === '') {
      next.keyword.invalid = true;
      next.keyword.message = 'Please enter some keywords';
    }

    // Location required only if autoLocation is false
    if (!autoLocation && (!location || location.trim() === '')) {
      next.location.invalid = true;
      next.location.message = 'Location is required when auto-detect is disabled';
    }

    // Distance: must be number between 1 and 100
    const distRaw = String(distance);
    const distNum = Number(distRaw);
    if (distRaw === '' || isNaN(distNum)) {
      next.distance.invalid = true;
      next.distance.message = 'Must be a number';
    } else if (distNum <= 0) {
      next.distance.invalid = true;
      next.distance.message = 'Must be positive';
    } else if (distNum > 100) {
      next.distance.invalid = true;
      next.distance.message = 'Cannot exceed 100 miles';
    }

    setErrors(next);
    return next.keyword.invalid || next.location.invalid || next.distance.invalid;
  };

  const searchEvents = useCallback(async () => {
    let loc = location;
    if (autoLocation) {
      loc = await findLocation();
    }
    if (handleInvalidInput()) return;
    
    const params = new URLSearchParams({
      keywords,
      category,
      loc,
      distance
    });
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, [keywords, category, location, autoLocation, distance]);

  const errorOccurred = errors.keyword.invalid || errors.location.invalid || errors.distance.invalid;

  return (
    <Flex className="search" direction="column" p="2" gap="2">
      <Flex direction={{initial: "column", md: "row"}} justify="between" p="2" gap="2">
          <Keyword 
            value={keywords}
            onChange={setKeywords}
            isInvalid={errors.keyword.invalid}
            errorMessage={errors.keyword.message}
          />
          <Category value={category} onChange={setCategory} />
          <Location
            value={location}
            onChange={setLocation}
            autoDetect={autoLocation}
            onAutoDetectChange={setAutoLocation}
            isInvalid={errors.location.invalid}
            errorMessage={errors.location.message}
          />
          <Distance 
            value={distance}
            onChange={setDistance}
            isInvalid={errors.distance.invalid}
            errorMessage={errors.distance.message}
          />
        <Flex 
          width={{initial: "100%", md: "50%"}}
          direction="column" 
          justify="end" 
          className={errorOccurred ? 'search-button-container' : ''}
        >
          <Button
            width={{initial: "100%", md: "50%"}}
            color="gray"
            variant="solid"
            highContrast
            onClick={searchEvents}
          >
            <MagnifyingGlassIcon />
            <Text size="1">Search Events</Text>
          </Button>
        </Flex>
      </Flex>
      <Results data={results} />
    </Flex>
  );
};

export default Search;