export const sortByDate = (a, b) => {
  return new Date(b.created_at) - new Date(a.created_at);
};

export const sortByEmail = (a, b) => {
  const emailA = a.email.toLowerCase();
  const emailB = b.email.toLowerCase();

  if (emailA < emailB) {
    return -1;
  }
  if (emailA > emailB) {
    return 1;
  }
  return 0;
};

export const sortByPrize = (a, b) => {
  const prizeComparison = comparePrizes(a, b);
  if (prizeComparison !== 0) {
    return prizeComparison; // If prizes are different, return the prize comparison result
  }

  // If prizes are the same, sort by date using handleSortByDate
  return sortByDate(a, b);
};

const comparePrizes = (a, b) => {
  const prizeA = a.prize === null ? "" : a.prize.toLowerCase(); // Treat null as empty string
  const prizeB = b.prize === null ? "" : b.prize.toLowerCase(); // Treat null as empty string

  if (prizeA === "" && prizeB === "") {
    return 0;
  }
  if (prizeA === "") {
    return 1;
  }
  if (prizeB === "") {
    return -1;
  }

  if (prizeA < prizeB) {
    return -1;
  }
  if (prizeA > prizeB) {
    return 1;
  }
  return 0;
};

export const sortByDateReversed = (a, b) => {
  return sortByDate(b, a);
};

export const sortByPrizeReversed = (a, b) => {
  return sortByPrize(b, a);
};

// Assume the filter function is defined here
export const filterEmailList = (emailList, searchString) => {
  if (!searchString) {
    return emailList; // If the search string is empty, return the original list
  }

  const normalizedSearchString = searchString.toLowerCase();

  return emailList.filter((item) => {
    const normalizedEmail = item.email.toLowerCase();
    return normalizedEmail.includes(normalizedSearchString);
  });
};
