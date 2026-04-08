import { Flex, Text, TextField, Switch } from '@radix-ui/themes';

const Location = ({ value, onChange, autoDetect, onAutoDetectChange, isInvalid = false, errorMessage = '' }) => {
  return (
    <Flex width="100%" direction="column">
      <Flex direction="row" justify="between">
        <Text as="span" size="1" mb="1" weight="bold" className={isInvalid ? 'label-invalid' : ''}>
          Location
          <span className={(!autoDetect) ? 'required' : 'not-required'}>*</span>
        </Text>
        <Flex direction="row" justify="center" gap="2">
          <Text as="span" size="1" mb="1" weight="bold" className={isInvalid ? 'label-invalid' : ''}>
            Auto-detect Location
          </Text>
          <Switch 
            size="1" 
            color="gray" 
            highContrast
            checked={autoDetect}
            onCheckedChange={onAutoDetectChange}
          />
        </Flex>
      </Flex>
      <TextField.Root
        className={isInvalid ? 'input-invalid' : ''}
        placeholder="Enter location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={autoDetect}
      />
      {isInvalid && errorMessage && (
        <Text as="div" size="1" mb="1" weight="medium" className="error-text">
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
}

export default Location;