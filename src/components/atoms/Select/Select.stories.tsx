import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import { Select } from 'antd';
import { MultipleSelect, SearchableSelect, TagsSelect } from './index';
import {
  SELECT_CONFIGS,
  GENDER_OPTIONS,
  DURATION_TYPE_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  YES_NO_OPTIONS,
  filterCaseInsensitive,
  filterStartsWith,
  filterFuzzy} from './selectConfig';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Standardized Select components with pre-configured behaviors and common option sets.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const sampleOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
  { label: 'Option 4', value: '4' },
  { label: 'Option 5', value: '5' },
];

const largeOptionsList = Array.from({ length: 100 }, (_, i) => ({
  label: `Option ${i + 1}`,
  value: `${i + 1}`,
}));

// Standard Select
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select an option"
        options={sampleOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithClearButton: Story = {
  render: () => {
    const [value, setValue] = useState<string>('1');
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select an option"
        options={sampleOptions}
        value={value}
        onChange={setValue}
        allowClear
      />
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Search options"
        options={largeOptionsList}
        value={value}
        onChange={setValue}
        showSearch
        filterOption={filterCaseInsensitive}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Searchable select with case-insensitive filtering.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    style: { width: 200 },
    placeholder: 'Disabled',
    options: sampleOptions,
    disabled: true,
  },
};

// Multiple Select
export const Multiple: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>([]);
    return (
      <MultipleSelect
        style={{ width: '100%' }}
        placeholder="Select multiple options"
        options={sampleOptions}
        value={values}
        onChange={setValues}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'MultipleSelect with responsive tag display.',
      },
    },
  },
};

export const MultipleWithManySelected: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(['1', '2', '3', '4']);
    return (
      <MultipleSelect
        style={{ width: '100%' }}
        placeholder="Select multiple"
        options={largeOptionsList}
        value={values}
        onChange={setValues}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows responsive maxTagCount behavior with many selections.',
      },
    },
  },
};

// Searchable Select
export const SearchableVariant: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <SearchableSelect
        style={{ width: '100%' }}
        placeholder="Search and select"
        options={largeOptionsList}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured searchable select with clear button.',
      },
    },
  },
};

// Tags Select
export const Tags: Story = {
  render: () => {
    const [values, setValues] = useState<string[]>(['tag1']);
    return (
      <TagsSelect
        style={{ width: '100%' }}
        placeholder="Type to create tags"
        value={values}
        onChange={setValues}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'TagsSelect allows creating custom tags by typing.',
      },
    },
  },
};

// Common Option Sets
export const GenderOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select gender"
        options={GENDER_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'GENDER_OPTIONS: Male, Female, Other, Prefer not to say.',
      },
    },
  },
};

export const DurationTypeOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select duration type"
        options={DURATION_TYPE_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'DURATION_TYPE_OPTIONS: Days, Weeks, Months, Years.',
      },
    },
  },
};

export const DayOfWeekOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select day"
        options={DAY_OF_WEEK_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'DAY_OF_WEEK_OPTIONS: Monday through Sunday.',
      },
    },
  },
};

export const StatusOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select status"
        options={STATUS_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'STATUS_OPTIONS: Active, Inactive, Pending.',
      },
    },
  },
};

export const PriorityOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select priority"
        options={PRIORITY_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'PRIORITY_OPTIONS: Low, Medium, High, Critical.',
      },
    },
  },
};

export const YesNoOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 200 }}
        placeholder="Select yes or no"
        options={YES_NO_OPTIONS}
        value={value}
        onChange={setValue}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'YES_NO_OPTIONS: Simple boolean choice.',
      },
    },
  },
};

// Filter Functions
export const CaseInsensitiveFilter: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 250 }}
        placeholder="Case-insensitive search"
        options={[
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry' },
          { label: 'Date', value: 'date' },
          { label: 'Elderberry', value: 'elderberry' },
        ]}
        value={value}
        onChange={setValue}
        showSearch
        filterOption={filterCaseInsensitive}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Matches anywhere in the string, case-insensitive. Try typing "err" to find "Cherry" or "Elderberry".',
      },
    },
  },
};

export const StartsWithFilter: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 250 }}
        placeholder="Starts-with search"
        options={[
          { label: 'Apple', value: 'apple' },
          { label: 'Apricot', value: 'apricot' },
          { label: 'Banana', value: 'banana' },
          { label: 'Blueberry', value: 'blueberry' },
          { label: 'Cherry', value: 'cherry' },
        ]}
        value={value}
        onChange={setValue}
        showSearch
        filterOption={filterStartsWith}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Matches only the beginning of strings. Try typing "ap" to find "Apple" and "Apricot".',
      },
    },
  },
};

export const FuzzyFilter: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <Select
        style={{ width: 250 }}
        placeholder="Fuzzy search"
        options={largeOptionsList}
        value={value}
        onChange={setValue}
        showSearch
        filterOption={filterFuzzy}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fuzzy matching algorithm for typo-tolerant search.',
      },
    },
  },
};

// Configuration Showcase
export const AllConfigurations: Story = {
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string>();
    const [value3, setValue3] = useState<string[]>([]);
    const [value4, setValue4] = useState<string>();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <div>
          <strong>Multiple Select Config:</strong>
          <Select
            {...SELECT_CONFIGS.multiple}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
            placeholder="Multiple selection"
            options={sampleOptions}
            value={value1}
            onChange={setValue1}
          />
        </div>

        <div>
          <strong>Searchable Config:</strong>
          <Select
            {...SELECT_CONFIGS.searchable}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
            placeholder="Searchable dropdown"
            options={largeOptionsList}
            value={value2}
            onChange={setValue2}
          />
        </div>

        <div>
          <strong>Tags Config:</strong>
          <Select
            {...SELECT_CONFIGS.tags}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
            placeholder="Create custom tags"
            value={value3}
            onChange={setValue3}
          />
        </div>

        <div>
          <strong>Required Config (no clear):</strong>
          <Select
            {...SELECT_CONFIGS.required}
            style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
            placeholder="Required field"
            options={sampleOptions}
            value={value4}
            onChange={setValue4}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All available SELECT_CONFIGS presets.',
      },
    },
  },
};
