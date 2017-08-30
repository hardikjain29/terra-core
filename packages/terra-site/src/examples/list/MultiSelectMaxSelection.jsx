import React from 'react';

import MultiSelectList from 'terra-list/lib/MultiSelectList';

const list = () => (
  <MultiSelectList maxSelectionCount={2}>
    <MultiSelectList.Item content={<span>test</span>} key="123" />
    <MultiSelectList.Item content={<span>test</span>} key="124" />
    <MultiSelectList.Item content={<span>test</span>} key="125" />
  </MultiSelectList>);

export default list;
