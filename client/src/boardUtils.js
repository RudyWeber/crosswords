export const makeEmptyBoard = (width, height) =>
  Array.from({ length: height }, () => Array.from({ length: width }, () => ""));

export const updateAt = (x, y, value) => (board) =>
  board.map((row, rowIndex) =>
    rowIndex === y
      ? row.map((col, colIndex) => (colIndex === x ? value : col))
      : row
  );
