import {
  CDataTable,
  CPagination
} from "@coreui/react";
import { NoData } from "src/_components";

export const DataTable = (props) => {
  return (
    <>
      <CDataTable
        noItemsViewSlot={ <NoData/> }
        items={props.results || []}
        fields={props.fields}
        hover
        bordered
        scopedSlots={props.scopedSlots}
        responsive={false}
        onRowClick={props.onRowClick}
      />
      {(props.pages > 1 || props.total > 0) &&
        <div className="c-paginationx d-flex justify-content-between align-items-center mt-2">
          <CPagination
            activePage={props.activePage}
            onActivePageChange={props.onActivePageChange.bind(this)}
            pages={props.pages}
            doubleArrows={true}
            align="start"
          />
          {props.total && <div>Tổng số: {props.total}</div>}
        </div>
      }
    </>
  )
}
