import React, { ComponentProps, useState } from 'react';
import { InlineField, Input, Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { uniqueId } from 'lodash';


const defaultIntervalOptions = ["hey"];

const hasValue = (searchValue) => ({ length }) => length === searchValue;

const getInitialState = (initialValue) => {
    return defaultIntervalOptions.concat(
      defaultIntervalOptions.some(hasValue(initialValue))
        ? []
        : [initialValue]
    );
  };

export const DateHistogramSettingsEditor = ({ bucketAgg }) => {

  const [intervalOptions, setIntervalOptions] = useState(
    getInitialState(bucketAgg.length)
  );

  const addIntervalOption = (value) => setIntervalOptions([...intervalOptions]);

  return (
    <>
      <InlineField label="Min Doc Count">
        <Input
          defaultValue={
            intervalOptions
          }
        />
      </InlineField>

      <InlineField label="Trim Edges" tooltip="Trim the edges on the timeseries datapoints">
        <Input
          defaultValue={
            intervalOptions
          }
        />
      </InlineField>
    </>
  );
};