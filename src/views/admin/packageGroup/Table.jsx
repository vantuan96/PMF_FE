import React, { Component, Fragment } from 'react';
import update from 'immutability-helper';
import {filterTree} from "src/plugins/treefold/filterTree"
import Treefold from 'react-treefold';
import { getStyle, getIcon } from 'src/plugins/treefold/utils';
import {
  CButton,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from "@coreui/react";
import clsx from 'clsx'
import {
  hasPermissions
} from 'src/_helpers'
const bool = (val, ifUndefined) => (val !== undefined ? val : ifUndefined);
const lengthOf = list => (list && list.length > 0 ? list.length : null);

export class Table extends Component {
  handlers = {
    standard: this.createHandlers('standard'),
    filtered: this.createHandlers('filtered'),
  };
  constructor(props) {
    super(props);
    this.state = {
      datas: null,
      inputValue: '',
      expanded: {
        standard: {},
        filtered: {},
      },
      isExpandedAll: false
    };
    this.toggleExpanded = this.toggleExpanded.bind(this);
  }
  toggleExpanded () {
    var {isExpandedAll} = this.state
    this.setState({expanded: {
      standard: {},
      filtered: {},
    }})
    this.setState({isExpandedAll: !isExpandedAll})
  }
  applyCallbackAction (item, action) {
    if (this.props.applyCallbackAction)
      this.props.applyCallbackAction(item, action)
  }
  onInputValueChange (inputValue) {
    this.setState(state =>
      update(state, {
        inputValue: { $set: inputValue },
        expanded: { filtered: { $set: {} } },
      })
    );
  }
  applyCallback (val) {
    if (this.props.onChange)
      this.props.onChange(val)
  }
  createHandlers(key) {
    const defaultExpanded = key === 'filtered';
    return {
      isNodeExpanded: ({ id }) =>
        bool(this.state.expanded[key][id], defaultExpanded),
      onToggleExpand: ({ id }) => {
        this.setState(state =>
          update(state, {
            expanded: {
              [key]: {
                [id]: val => !bool(val, defaultExpanded),
              },
            },
          })
        );
      },
    };
  }
  btnEdit (node) {
    return (
      <>
      {hasPermissions(['ADMINPACKAGEGROUP_UPDATEPACKAGEGROUPAPI', 'ADMINPACKAGEGROUP_DELETEPACKAGEGROUPAPI']) && 
      <CDropdown className="dropdown-sm">
        <CDropdownToggle color="info" size="sm">
          <i className="fa fa-fw fa-bars" aria-hidden="true"></i>
        </CDropdownToggle>
        <CDropdownMenu>
        {hasPermissions(['ADMINPACKAGEGROUP_UPDATEPACKAGEGROUPAPI']) && <CDropdownItem to={"/admin/PackageGroup/" + node.Id}>Sửa</CDropdownItem>}
        {hasPermissions(['ADMINPACKAGEGROUP_DELETEPACKAGEGROUPAPI']) && <CDropdownItem onClick={() => this.applyCallbackAction(node, 'delete')}>Xóa</CDropdownItem>}
        </CDropdownMenu>
      </CDropdown>
      }
      </>
    )
  }
  btnSelect (node) {
    const { selected, allowSelectChil } = this.props;
    if (allowSelectChil) return (
      <>
        {selected && node.Id === selected.Id ? '' :
        <CButton
          color="primary"
          size={'sm'}
          onClick={() => this.applyCallback(node)}
        >Chọn</CButton>
      }
      </>
    )
    return (
      <>
        {selected && node.path.includes(selected.Id) ? '' :
        <CButton
          color="primary"
          size={'sm'}
          onClick={() => this.applyCallback(node)}
        >Chọn</CButton>
      }
      </>
    )
  }
  render() {
    const { nodes, query, type } = this.props;
    const { selected, isExpandedAll } = this.state;
    const items = filterTree(nodes, query.Search);
    // const isFiltered = items !== nodes;
    const handlers = this.handlers[(query.Search || isExpandedAll) ? 'filtered' : 'standard'];
    return (
      <table className="f-table">
        <thead>
          <tr>
            <th width="250px">
              <span className="pointer">
                <i onClick={() => this.toggleExpanded()} className={getIcon(isExpandedAll)} aria-hidden="true" />
              </span>
              Mã
            </th>
            <th>Tên</th>
            {type !== 'select' ? <th width="150px">Trạng thái</th> : null}
            <th width="1">-/-</th>
          </tr>
        </thead>
        <tbody>
          <Treefold
            nodes={items}
            {...handlers}
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
                    selected: selected && node.Id === selected.Id,
                    InActive: !node.IsActived
                  })}>
                  <td style={getStyle(level + ((isFolder && hasChildNodes) ? 0 : 1))}>
                    {(isFolder && hasChildNodes) && (
                      <span className="toggle-icon" {...getToggleProps()}>
                        <i className={getIcon(isExpanded)} aria-hidden="true" />
                      </span>
                    )}
                    <span className="node-code">{node.Code}</span>
                  </td>
                  <td><span>{(node.Name)} {lengthOf(node.children) ? <>({lengthOf(node.children)})</> : null}</span></td>
                  {type !== 'select' ? <td widd="1">{node.IsActived ? <CBadge color="primary">Đang hoạt động</CBadge> : <CBadge color="danger">Đã dừng hoạt động</CBadge>}</td> : null}
                  <td>
                    {type === 'select' ?
                    this.btnSelect(node)
                    :
                    <>
                      {this.btnEdit(node)}
                    </>
                  }
                  </td>
                </tr>
                {isExpanded &&
                  (hasChildNodes ? (
                    renderChildNodes()
                  ) : (
                    // <tr className="empty">
                    //   <td colSpan={3} style={getStyle(level + 2)}>
                    //     This folder is empty
                    //   </td>
                    // </tr>
                    null
                  ))}
              </Fragment>
            )}
          />
        </tbody>
      </table>
    );
  }
}