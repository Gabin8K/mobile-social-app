import { useState } from "react";

type Props = {
  itemsPerPage: number;
}


export function usePaginationRange(props: Props) {
  const { itemsPerPage } = props;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [update, setUpdate] = useState<boolean>(false)

  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  const cantFetch = currentPage * itemsPerPage < totalItems;

  const nextPage = () => {
    if (cantFetch) {
      setCurrentPage(currentPage + 1);
      setUpdate(prev => !prev)
    }
  }

  const reset = () => {
    setCurrentPage(1);
    setTotalItems(0);
    setUpdate(prev => !prev)
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