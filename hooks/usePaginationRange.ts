import { useState } from "react";

type Props = {
  itemsPerPage: number;
}


export function usePaginationRange(props: Props) {
  const { itemsPerPage } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [update, setUpdate] = useState<number>(0)

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const cantFetch = currentPage * itemsPerPage < totalItems;

  const nextPage = () => {
    if (cantFetch) {
      setCurrentPage(currentPage + 1);
      setUpdate(update + 1)
    }
  }

  const reset = () => {
    setCurrentPage(1);
    setTotalItems(0);
    setUpdate(update + 1)
  }

  return {
    setTotalItems,
    nextPage,
    reset,
    update,
    from,
    to,
    currentPage,
  }
}