import React from 'react';
import {
  Table as HeroUITable,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue
} from '@heroui/react';

const Table = ({
  columns = [],
  rows = [],
  selectionMode = 'none',
  selectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  className = '',
  emptyContent = 'No data available',
  ...props
}) => {
  return (
    <HeroUITable
      aria-label="Data table"
      selectionMode={selectionMode}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      className={className}
      {...props}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            allowsSorting={column.sortable}
            align={column.align || 'start'}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={rows} emptyContent={emptyContent}>
        {(item) => (
          <TableRow key={item.key || getKeyValue(item, columns[0]?.key)}>
            {(columnKey) => (
              <TableCell>
                {getKeyValue(item, columnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </HeroUITable>
  );
};

export default Table;
