const makeEmptyBoard = (width, height) =>
  Array.from({ length: height }, () => Array.from({ length: width }, () => ""));

function* nextPosition({ word, start: [x, y], horizontal }) {
  for (let i = 0; i < word.length; i++) {
    if (horizontal) {
      yield [x + i, y, word[i]];
    } else {
      yield [x, y + i, word[i]];
    }
  }
}

const intersection = (A, B) => {
  const Bset = new Set(B);

  return [...A].reduce(
    (unionAcc, x) => (Bset.has(x) ? [...unionAcc, x] : unionAcc),
    []
  );
};

const findAllIndexes = (xs, x) =>
  [...xs].reduce((indexes, y, i) => (x === y ? [...indexes, i] : indexes), []);

const canPlace = (board, word, [x, y], horizontal) => {
  let index = -1;

  findAllIndexes(word, board[y][x]).some((i) => {
    if (horizontal) {
      for (let j = x - i; j < x + word.length - i; j++) {
        if (
          typeof board[y][j] === "undefined" ||
          (board[y][j] !== "" && board[y][j] !== word[j - (x - i)]) ||
          (board[y][j] === "" &&
            j !== x &&
            ((board[y - 1] && board[y - 1][j]) ||
              (board[y + 1] && board[y + 1][j]))) ||
          (j === x - i && board[y][j - 1]) ||
          (j === x + word.length - i - 1 && board[y][j + 1])
        ) {
          return false;
        }
      }

      index = i;

      return true;
    } else {
      for (let j = y - i; j < y + word.length - i; j++) {
        if (
          typeof board[j] === "undefined" ||
          (board[j][x] !== "" && board[j][x] !== word[j - (y - i)]) ||
          (board[j][x] === "" &&
            j !== y &&
            (board[j][x - 1] || board[j][x + 1])) ||
          (j === y - i && board[j - 1] && board[j - 1][x]) ||
          (j === y + word.length - i - 1 && board[j + 1] && board[j + 1][x])
        ) {
          return false;
        }
      }

      index = i;

      return true;
    }
  });

  return index;
};

const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

const updateAtMany = (positions, board) => {
  const positionMaps = positions.reduce((acc, [x, y, c]) => ({
    ...acc,
    [`${x}-${y}`]: c,
  }));
  return board.map((row, rowIndex) =>
    row.map((col, colIndex) => {
      const positionString = `${colIndex}-${rowIndex}`;
      return positionMaps[positionString] ? positionMaps[positionString] : col;
    })
  );
};

const placeWord = ({ board, placedWordsInfo }, word) => {
  if (placedWordsInfo.length === 0) {
    const horizontal = Math.random() < 0.5;

    const startX = horizontal
      ? rand(0, board[0].length - word.length - 1)
      : rand(0, board.length);
    const startY = horizontal
      ? rand(0, board.length)
      : rand(0, board.length - word.length - 1);
    const positions = [
      ...nextPosition({ word, start: [startX, startY], horizontal }),
    ];

    return {
      board: updateAtMany(positions, board),
      placedWordsInfo: [{ word, positions, horizontal }],
    };
  }

  let ret = { board, placedWordsInfo };

  placedWordsInfo.some((placedWordInfo) => {
    const inter = intersection(placedWordInfo.word, word);

    if (inter.length === 0) {
      return false;
    }

    const isHorizontal = placedWordInfo.horizontal;

    return inter.some((letter) => {
      return findAllIndexes(placedWordInfo.word, letter)
        .map((i) => placedWordInfo.positions[i])
        .some(([x, y]) => {
          const currentWordOrientationIsHorizontal = !isHorizontal;
          const i = canPlace(
            board,
            word,
            [x, y],
            currentWordOrientationIsHorizontal
          );

          if (i > -1) {
            // Weird.
            //
            // const start2 = currentWordOrientationIsHorizontal ? [x - i, y] : [x, y - i];
            // const newWordPositions = [...nextPosition({word, start: start2, horizontal: currentWordOrientationIsHorizontal})];
            // console.log({newWordPositions});
            // ret = {
            //   board: updateAtMany(newWordPositions, board),
            //   placedWordsInfo: [
            //     {
            //       word,
            //       positions: newWordPositions,
            //       horizontal: currentWordOrientationIsHorizontal,
            //     },
            //     ...placedWordsInfo,
            //   ],
            // };

            // return true;

            let start = null;
            if (currentWordOrientationIsHorizontal) {
              start = [x - i, y];
              for (let j = x - i; j < x + word.length - i; j++) {
                board[y][j] = word[j - (x - i)];
              }
            } else {
              start = [x, y - i];
              for (let j = y - i; j < y + word.length - i; j++) {
                board[j][x] = word[j - (y - i)];
              }
            }

            ret = {
              board,
              placedWordsInfo: [
                {
                  word,
                  positions: [
                    ...nextPosition({
                      word,
                      start,
                      horizontal: currentWordOrientationIsHorizontal,
                    }),
                  ],
                  horizontal: currentWordOrientationIsHorizontal,
                },
                ...placedWordsInfo,
              ],
            };

            return true;
          }

          return false;
        });
    });
  });

  return ret;
};

const withNumbers = (boardInfo) => {
  const [positionsToNumber, , numberedWords] = boardInfo.words.reduce(
    ([positionsToNumber, currentNumber, numberedWords], wordInfo) => {
      const {
        positions: [[x, y]],
      } = wordInfo;
      const positionString = `${x}-${y}`;

      if (positionsToNumber[positionString]) {
        return [
          positionsToNumber,
          currentNumber,
          [
            ...numberedWords,
            { ...wordInfo, number: positionsToNumber[positionString] },
          ],
        ];
      }

      return [
        {
          ...positionsToNumber,
          [positionString]: currentNumber,
        },
        currentNumber + 1,
        [
          ...numberedWords,
          {
            ...wordInfo,
            number: currentNumber,
          },
        ],
      ];
    },
    [{}, 1, []]
  );

  return {
    ...boardInfo,
    positionsToNumber,
    words: numberedWords
  };
};

const withDefinitions = (words, dict) =>
  words.map((info) => ({
    ...info,
    def: dict[info.word],
  }));

const center = ({ placedWordsInfo }, borderSize = 1) => {
  const [minX, maxX, minY, maxY] = placedWordsInfo.reduce(
    ([minX, maxX, minY, maxY], { positions }) => {
      const [startX, startY] = positions[0];
      const [endX, endY] = positions[positions.length - 1];

      return [
        Math.min(minX, startX),
        Math.max(endX, maxX),
        Math.min(minY, startY),
        Math.max(maxY, endY),
      ];
    },
    [Infinity, 0, Infinity, 0]
  );

  const newWidth = maxX - minX + 1 + borderSize * 2;
  const newHeight = maxY - minY + 1 + borderSize * 2;

  const deltaX = minX - borderSize;
  const deltaY = minY - borderSize;

  const newInfo = placedWordsInfo.map((info) => ({
    ...info,
    positions: info.positions.map(([x, y, c]) => [x - deltaX, y - deltaY, c]),
  }));

  return {
    dimensions: {
      width: newWidth,
      height: newHeight,
    },
    words: newInfo,
  };
};

const generate = (dict, retries = 0) => {
  const sortedWords = Object.keys(dict).sort((wa, wz) => wz.length - wa.length);
  const maxLength = sortedWords[0].length;
  const initialBoard = makeEmptyBoard(maxLength * 2, maxLength * 2);
  const initialState = {
    board: initialBoard,
    placedWordsInfo: [],
  };

  const boardInfo = center(sortedWords.reduce(placeWord, initialState));

  const boardInfoWithDefinitionsAndNumbers = withNumbers({
    ...boardInfo,
    words: withDefinitions(boardInfo.words, dict),
  });

  if (sortedWords.length !== boardInfoWithDefinitionsAndNumbers.words.length) {
    if (retries < 3) return generate(dict, retries + 1);
    else
      return {
        ...boardInfoWithDefinitionsAndNumbers,
        incomplete: true,
      };
  }

  return boardInfoWithDefinitionsAndNumbers;
};

export default generate;
