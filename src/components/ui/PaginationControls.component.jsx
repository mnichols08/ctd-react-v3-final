import { useId } from "react";
import {
  PaginationContainer,
  PaginationRow,
  PageButton,
  PageInfo,
  PageSelectLabel,
  PageSelect,
  RangeInfo,
} from "./PaginationControls.styles";

function PaginationControls({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  idPrefix,
}) {
  const generatedId = useId();
  const pageSizeOptions = [5, 10, 15, 20, 25];
  const defaultPageSize = 10;
  const validPageSize = pageSize > 0 ? pageSize : defaultPageSize;
  const totalPages = Math.ceil(totalItems / validPageSize);
  const validCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const canGoBack = validCurrentPage > 1;
  const canGoForward = validCurrentPage < totalPages;
  const hasItems = totalItems > 0;
  const selectId = `${idPrefix ?? generatedId}-page-size-select`;

  if (!hasItems) {
    return null; // Don't render pagination controls if there are no items
  }
  const handlePageChange = (newPage) => {
    const page = Math.min(Math.max(newPage, 1), totalPages);
    onPageChange(page);
  };

  const handlePageSizeChange = (event) => {
    onPageSizeChange(Number(event.target.value));
    onPageChange(1);
  };

  return (
    <PaginationContainer>
      <PaginationRow>
        <PageButton
          onClick={() => handlePageChange(validCurrentPage - 1)}
          disabled={!canGoBack}
          aria-label="Previous page"
        >
          Previous
        </PageButton>
        <PageInfo>
          Page {validCurrentPage} of {totalPages}
        </PageInfo>
        <PageButton
          onClick={() => handlePageChange(validCurrentPage + 1)}
          disabled={!canGoForward}
          aria-label="Next page"
        >
          Next
        </PageButton>
      </PaginationRow>
      <PaginationRow>
        <PageSelectLabel htmlFor={selectId}>Items per page:</PageSelectLabel>
        <PageSelect
          id={selectId}
          value={validPageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </PageSelect>
        <RangeInfo>
          Showing {(validCurrentPage - 1) * validPageSize + 1} to {Math.min(validCurrentPage * validPageSize, totalItems)} of {totalItems} items
        </RangeInfo>
      </PaginationRow>
    </PaginationContainer>
  );
}

export default PaginationControls;
