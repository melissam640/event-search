import { Flex, Text, TextField } from '@radix-ui/themes';

const Distance = ({ value, onChange, isInvalid = false, errorMessage = '' }) => {
  return (
    <Flex width={{initial: "100%", md: "50%"}} direction="column">
      <Text as="div" size="1" mb="1" weight="bold" className={isInvalid ? 'label-invalid' : ''}>
        Distance
        <span className="required">*</span>
      </Text>
      <TextField.Root
        className={isInvalid ? 'input-invalid' : ''}
        placeholder="10"
        type="number" min="1" max="100" step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <TextField.Slot side="right">
        miles
        </TextField.Slot>
      </TextField.Root>
      {isInvalid && errorMessage && (
        <Text as="div" size="1" mb="1" weight="medium" className="error-text">
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
}

export default Distance;