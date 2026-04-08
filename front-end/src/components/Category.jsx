import { Flex, Text, Select } from '@radix-ui/themes';

const Category = ({ value, onChange }) => {
  return (
    <Flex width={{initial: "100%", md: "50%"}} direction="column">
      <Text as="div" size="1" mb="1" weight="bold">
        Category
        <span className="required">*</span>
      </Text>
      {/* <Select.Root defaultValue="all"> */}
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger />
        <Select.Content>
            <Select.Group>
            <Select.Item value="all">All</Select.Item>
            <Select.Item value="music">Music</Select.Item>
            <Select.Item value="sports">Sports</Select.Item>
            <Select.Item value="arts&theatre">Arts & Theatre</Select.Item>
            <Select.Item value="film">Film</Select.Item>
            <Select.Item value="miscellaneous">Miscellaneous</Select.Item>
            </Select.Group>
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}

export default Category;