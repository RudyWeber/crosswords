import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import { makeEmptyBoard, updateAt } from "./boardUtils";

import * as styles from "./Board.module.scss";

const CELL_SIZE = 30;

const Block = ({ rowIndex, colIndex, width }) => (
  <div
    key={`${rowIndex}-${colIndex}`}
    class={styles.grid__block}
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
    }}
  />
);

const Input = ({ rowIndex, colIndex, highlighted, width, ...props }) => (
  <input
    type="text"
    class={`${styles.grid__letterInput} ${
      highlighted ? styles["grid__letterInput--highlighted"] : ""
    }`}
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      fontSize: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
    }}
    {...props}
  />
);

const Valid = ({ rowIndex, colIndex, width, children }) => (
  <div
    key={`${rowIndex}-${colIndex}`}
    class={styles.grid__valid}
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      fontSize: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
    }}
  >
    {children}
  </div>
);

const Definition = ({ currentWordDefinition, position }) => (
  <div
    class={`${styles.definition} ${
      position === "bottom"
        ? styles["definition--bottom"]
        : position === "top"
        ? styles["definition--top"]
        : ""
    }`}
  >
    {currentWordDefinition || "Start playing!"}
  </div>
);

const WithNumber = ({ position, isMobile, positionsToNumber, children }) => (
  <div class={styles.grid__withNumberContainer}>
    {children}
    {positionsToNumber[position] ? (
      <span class={styles.grid__withNumberContainer__number}>
        {positionsToNumber[position]}
      </span>
    ) : null}
  </div>
);

const validationStuff = (board, words, foundWords) => {
  return words.reduce(
    ([validWords, allValidPositions], wordInfo) => {
      const wordPositions = wordInfo.positions;

      if (wordPositions.every(([x, y, c]) => board[y][x] === c.toUpperCase())) {
        return [
          [
            ...validWords,
            ...(foundWords.has(wordInfo.word) ? [] : [wordInfo.word]),
          ],
          new Set([
            ...wordPositions.map(([x, y]) => `${x}-${y}`),
            ...allValidPositions,
          ]),
        ];
      }

      return [validWords, allValidPositions];
    },
    [[], new Set()]
  );
};

const getWordFromCoordinate = (words, colIndex, rowIndex) =>
  words.find((wordInfo) =>
    wordInfo.positions.some(([x, y]) => x === colIndex && y === rowIndex)
  );

const getNextNonValidPosition = (
  allValidPositions,
  highlightedWordPositions,
  currentPosition,
  prev = false
) => {
  let next = null;
  let i = 0;

  do {
    next =
      highlightedWordPositions[
        highlightedWordPositions.findIndex((pos) => pos === currentPosition) +
          (prev ? -1 : 1) * (1 + i++)
      ];
  } while (allValidPositions.has(next));

  return next;
};

const Board = ({
  boardInfo,
  highlightedWord,
  foundWords,
  onWordsFound,
  onFocus,
  currentWordDefinition,
  isMobile,
  allPositions,
}) => {
  const {
    dimensions: { width, height },
    positionsToNumber,
  } = boardInfo;

  const [board, setBoard] = useState(() => makeEmptyBoard(width, height));
  const highlightedWordPositions = useMemo(
    () =>
      highlightedWord
        ? boardInfo.words
            .find(({ word }) => word === highlightedWord)
            .positions.map(([x, y]) => `${x}-${y}`)
        : [],
    [boardInfo.words, highlightedWord]
  );
  const highlightedWordPositionsSet = useMemo(
    () => new Set(highlightedWordPositions),
    [highlightedWordPositions]
  );

  const [currentPosition, moveTo] = useState("");
  const focusMeRef = useRef();

  const [newValidWords, allValidPositions] = validationStuff(
    board,
    boardInfo.words,
    foundWords
  );

  const revealRamdomLetter = () => {
    const possibleWords = boardInfo.words.filter(
      ({ word }) => !foundWords.has(word)
    );
    const randomWord =
      possibleWords[Math.floor(Math.random() * possibleWords.length)];
    const possiblePositions = randomWord.positions.filter(
      ([x, y]) => !allValidPositions.has(`${x}-${y}`) && board[y][x] === ""
    );
    const [x, y, c] = possiblePositions[
      Math.floor(Math.random() * possiblePositions.length)
    ];

    setBoard(updateAt(x, y, c.toUpperCase()));
  };

  useEffect(() => {
    if (
      allValidPositions.has(currentPosition) ||
      !highlightedWordPositionsSet.has(currentPosition)
    ) {
      const next = allValidPositions.has(highlightedWordPositions[0])
        ? getNextNonValidPosition(
            allValidPositions,
            highlightedWordPositions,
            highlightedWordPositions[0]
          )
        : highlightedWordPositions[0];

      next && moveTo(next);
    } else {
      isMobile && focusMeRef.current?.base?.focus();
      focusMeRef.current?.base?.select();
    }

    if (newValidWords.length !== 0) {
      onWordsFound(newValidWords);
    }
  }, [
    allValidPositions,
    currentPosition,
    newValidWords,
    highlightedWordPositions,
    onWordsFound,
    highlightedWordPositionsSet,
    isMobile,
  ]);

  const grid = board.flatMap((row, rowIndex) =>
    row.map((col, colIndex) => {
      const positionString = `${colIndex}-${rowIndex}`;
      const isInHightlightedWord = highlightedWordPositionsSet.has(
        positionString
      );

      if (allPositions.has(positionString)) {
        if (allValidPositions.has(positionString)) {
          return (
            <WithNumber
              position={positionString}
              positionsToNumber={positionsToNumber}
              isMobile={isMobile}
              key={positionString}
            >
              <Valid colIndex={colIndex} rowIndex={rowIndex} width={width}>
                {col}
              </Valid>
            </WithNumber>
          );
        } else {
          return (
            <WithNumber
              position={positionString}
              positionsToNumber={positionsToNumber}
              isMobile={isMobile}
              key={positionString}
            >
              <Input
                name={positionString}
                colIndex={colIndex}
                rowIndex={rowIndex}
                highlighted={isInHightlightedWord}
                maxLength={1}
                value={board[rowIndex][colIndex]}
                tabIndex={
                  isInHightlightedWord ? colIndex + rowIndex : undefined
                }
                ref={
                  currentPosition === positionString ? focusMeRef : undefined
                }
                width={width}
                onFocus={(e) => {
                  e.preventDefault();

                  if (!isInHightlightedWord) {
                    onFocus(
                      getWordFromCoordinate(boardInfo.words, colIndex, rowIndex)
                        .word
                    );
                  }

                  if (currentPosition !== positionString) {
                    moveTo(positionString);
                  }
                }}
                onKeyup={(e) => {
                  e.preventDefault();

                  if (e.target.value.length === 0 && e.keyCode === 8) {
                    const prev = getNextNonValidPosition(
                      allValidPositions,
                      highlightedWordPositions,
                      positionString,
                      true
                    );

                    prev && moveTo(prev);
                  }
                }}
                onInput={(e) => {
                  e.preventDefault();
                  if (e.target.value.length === 1) {
                    const next = getNextNonValidPosition(
                      allValidPositions,
                      highlightedWordPositions,
                      positionString
                    );

                    next && moveTo(next);
                  }

                  setBoard(
                    updateAt(
                      colIndex,
                      rowIndex,
                      e.target.value.length > 1
                        ? board[rowIndex][colIndex]
                        : e.target.value.toUpperCase()
                    )
                  );
                }}
              />
            </WithNumber>
          );
        }
      }

      return (
        <Block
          key={positionString}
          colIndex={colIndex}
          rowIndex={rowIndex}
          width={width}
        />
      );
    })
  );

  return (
    <div
      class={styles.container}
      style={{
        maxWidth: `calc(min(${CELL_SIZE}px, 100vw / ${width} - .5vw) * (${width} + 2))`,
      }}
    >
      <Definition
        currentWordDefinition={currentWordDefinition}
        position={"top"}
      />
      <div
        class={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${width}) 1fr`,
          gridTemplateRows: `repeat(${height}) 1fr`,
        }}
      >
        {grid}
      </div>
      <Definition
        currentWordDefinition={currentWordDefinition}
        position={"bottom"}
      />
      <button
        onClick={revealRamdomLetter}
        disabled={foundWords.size === boardInfo.words.length}
        class={styles.hintButton}
      >
        💡 Need a hint?
      </button>
    </div>
  );
};

export default Board;
