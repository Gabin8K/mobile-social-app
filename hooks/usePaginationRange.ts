import { useState } from "react";

type Props = {
  itemsPerPage: number;
}


export function usePaginationRange(props: Props) {
  const { itemsPerPage } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const cantFetch = currentPage * itemsPerPage < totalItems;

  const nextPage = () => {
    if (cantFetch) {
      setCurrentPage(currentPage + 1);
    }
  }

  const refresh = () => {
    setCurrentPage(1);
    setTotalItems(0);
  }

  return {
    setTotalItems,
    nextPage,
    refresh,
    from,
    to,
    currentPage,
  }
}