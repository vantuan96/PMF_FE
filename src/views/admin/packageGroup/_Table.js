import React, { Fragment, useState } from 'react';
import Treefold from 'react-treefold';
import { getStyle, getIcon } from 'src/plugins/treefold/utils';
import {
  CButton
} from "@coreui/react";
import clsx from 'clsx'
const lengthOf = list => (list && list.length > 0 ? list.length : null);
const Table = (props) => {
  const [selected, setSelected] = useState(null);
  const applyCallback = (val) => {
    console.log(val)
    setSelected(val)
    if (props.onChange)
      props.onChange(val)
  };
  return (
  <table className="f-table">
    <thead>
      <tr>
        <th className="padding-left-20">Mã</th>
        <th>Tên</th>
        <th width="1">-/-</th>
      </tr>
    </thead>
    <tbody>
      <Treefold
        {...props}
        render={({
          node,
          level,
          isFolder,
          isExpanded,
          getToggleProps,
          hasChildNodes,
          renderChildNodes,
        }) => (
          <Fragment key={node.Id}>
            <tr key={node.Id} className={clsx({
                selected: selected && node.Id === selected.Id
              })}>
              <td style={getStyle(level + (isFolder ? 0 : 1))}>
                {isFolder && (
                  <span className="toggle-icon" {...getToggleProps()}>
                    <i className={getIcon(isExpanded)} aria-hidden="true" />
                  </span>
                )}
                {node.Code}
              </td>
              <td>{(node.Name)} {lengthOf(node.children) ? <>({lengthOf(node.children)})</> : ''}</td>
              <td>
                <CButton
                  color="primary"
                  size={'sm'}
                  onClick={() => applyCallback(node)}
                >Chọn</CButton>
              </td>
            </tr>
            {isExpanded &&
              (hasChildNodes ? (
                renderChildNodes()
              ) : (
                <tr className="empty">
                  <td colSpan={3} style={getStyle(level + 2)}>
                    This folder is empty
                  </td>
                </tr>
              ))}
          </Fragment>
        )}
      />
    </tbody>
  </table>
  )
};

export default Table;