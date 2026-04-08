import { useState, useEffect, useRef } from 'react';
import { Flex, Box, Popover, Text, TextField, IconButton, Spinner } from '@radix-ui/themes';
import { Cross2Icon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import './Keyword.css';

const Keyword = ({ value, onChange, isInvalid = false, errorMessage = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchSuggestions = async (keywords) => {
    if (!keywords) {
      setSuggestions([]);
      setOpen(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/suggest?keywords=${encodeURIComponent(keywords)}`);
      if (!resp.ok) throw new Error(`Network error: ${resp.status}`);
      const data = await resp.json();
      const suggestions = data || [];
      setSuggestions(suggestions);
      setOpen(suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = (e) => {
    const v = e.target.value;
    onChange(v);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(v);
    }, 300);
  };

  const selectSuggestion = (suggestion) => (e) => {
    e.preventDefault();
    onChange(suggestion);
    setSuggestions([]);
    setOpen(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  const clearKeyword = (e) => {
    e?.stopPropagation();
    onChange('');
    setSuggestions([]);
    setOpen(false);
    setIsLoading(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  return (
    <Flex width="100%" direction="column">
      <Text as="div" size="1" mb="1" weight="bold" className={isInvalid ? 'label-invalid' : ''}>
        Keywords
        <span className="required">*</span>
      </Text>

      <Popover.Root open={open}>
        <Popover.Trigger asChild>
          <Box>
            <TextField.Root
              className={isInvalid ? 'input-invalid' : ''}
              name="keywords"
              variant="surface"
              placeholder="Search for events..."
              value={value}
              onChange={getSuggestions}
            >
              <TextField.Slot side="right">
                { value && (
                  <IconButton 
                    color="gray"
                    variant="ghost"
                    onClick={clearKeyword}
                  >
                    <Cross2Icon />
                  </IconButton>
                )}
              </TextField.Slot>
              <TextField.Slot side="right">
                {isLoading ? (
                  <Spinner />
                ) : open ? (
                  <IconButton
                    color="gray"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                    aria-label="Close suggestions"
                  >
                    <ChevronUpIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    color="gray"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setOpen((s) => !s); }}
                    aria-label="Show suggestions"
                  >
                    <ChevronDownIcon />
                  </IconButton>
                )}
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </Popover.Trigger>

        <Popover.Content align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          <Flex id="suggestions" direction="column">
            {suggestions.map((s, idx) => (
                <Box
                  id="suggestion-item"
                  key={idx}
                  p="2"
                  onMouseDown={selectSuggestion(s)}
                >
                  {s}
                </Box>
              ))
            }
          </Flex>
        </Popover.Content>
      </Popover.Root>
      <Flex className="error-container">
        {isInvalid && errorMessage && (
          <Text as="div" size="1" mb="1" weight="medium" className="error-text">
            {errorMessage}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default Keyword;