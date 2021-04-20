import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import boardInfo from "./board.json";
import { makeEmptyBoard, updateAt } from "./boardUtils";

const {
  dimensions: { width, height },
  positionsToNumber,
} = boardInfo;

const CELL_SIZE = 30;

const Block = ({ rowIndex, colIndex }) => (
  <div
    key={`${rowIndex}-${colIndex}`}
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      outline: "thin solid white",
      backgroundColor: "#ff9f9f",
      boxSizing: "border-box",
    }}
  />
);

const Input = ({ rowIndex, colIndex, highlighted, ...props }) => (
  <input
    type="text"
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      fontSize: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      outline: "thin solid black",
      borderRadius: 0,
      border: "none",
      boxSizing: "border-box",
      textTransform: "uppercase",
      textAlign: "center",
      zIndex: 10,
      backgroundColor: highlighted ? "lightblue" : "transparent",
      position: "absolute",
      top: 0,
      left: 0,
    }}
    {...props}
  />
);

const Valid = ({ rowIndex, colIndex, ...props }) => (
  <div
    key={`${rowIndex}-${colIndex}`}
    style={{
      gridRow: rowIndex + 1,
      gridColumn: colIndex + 1,
      width: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      height: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      fontSize: `min(${CELL_SIZE}px, 100vw / ${width} - .5vw)`,
      lineHeight: "100%",
      outline: "thin solid black",
      borderRadius: 0,
      border: "none",
      boxSizing: "border-box",
      textTransform: "uppercase",
      display: "grid",
      placeItems: "center",
      backgroundColor: "lightgreen",
      zIndex: 10,
      position: "absolute",
      top: 0,
      left: 0,
    }}
    {...props}
  />
);

const Definition = ({ currentWordDefinition, position }) => (
  <div
    style={{
      outline: "2px solid black",
      backgroundColor: "#ff9f9f",
      padding: "10px 15px",
      marginTop: position === "bottom" ? 10 : "",
      marginBottom: position === "top" ? 10 : "",
      fontSize: "1.2em",
      textAlign: "center",
    }}
  >
    {currentWordDefinition || "Start playing!"}
  </div>
);

const WithNumber = ({ position, isMobile, children }) => (
  <div
    style={{
      position: "relative",
      boxSizing: "border-box",
    }}
  >
    {children}
    {positionsToNumber[position] ? (
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 2,
          pointerEvents: "none",
          fontSize: isMobile ? ".2rem" : ".7rem",
          zIndex: 20,
        }}
      >
        {positionsToNumber[position]}
      </span>
    ) : null}
  </div>
);

const allPositions = new Set(
  boardInfo.words
    .flatMap(({ positions }) => positions)
    .map(([x, y]) => `${x}-${y}`)
);

const validationStuff = (board, foundWords) => {
  return boardInfo.words.reduce(
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

const getWordFromCoordinate = (colIndex, rowIndex) =>
  boardInfo.words.find((wordInfo) =>
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
}) => {
  const [board, setBoard] = useState(() =>
    makeEmptyBoard(boardInfo.dimensions.width, boardInfo.dimensions.height)
  );
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

  const [newValidWords, allValidPositions] = validationStuff(board, foundWords);

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
            <WithNumber position={positionString} isMobile={isMobile}>
              <Valid
                colIndex={colIndex}
                rowIndex={rowIndex}
                key={positionString}
              >
                {col}
              </Valid>
            </WithNumber>
          );
        } else {
          return (
            <WithNumber position={positionString} isMobile={isMobile}>
              <Input
                name={positionString}
                key={positionString}
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
                onFocus={(e) => {
                  e.preventDefault();

                  if (!isInHightlightedWord) {
                    onFocus(getWordFromCoordinate(colIndex, rowIndex).word);
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
        <Block key={positionString} colIndex={colIndex} rowIndex={rowIndex} />
      );
    })
  );

  return (
    <div
      style={
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          maxWidth: `calc(min(${CELL_SIZE}px, 100vw / ${width} - .5vw) * (${width} + 2))`
        }
      }
    >
      {isMobile ? (
        <Definition
          currentWordDefinition={currentWordDefinition}
          position={"top"}
        />
      ) : null}
      <div
        style={{
          display: "grid",
          placeItems: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: 1,
            gridTemplateColumns: `repeat(${width}) 1fr`,
            gridTemplateRows: `repeat(${height}) 1fr`,
            outline: "2px solid black",
            boxSizing: "border-box",
          }}
        >
          {grid}
        </div>
      </div>
      {isMobile ? (
        <Definition
          currentWordDefinition={currentWordDefinition}
          position={"bottom"}
        />
      ) : null}
      <button
        onClick={revealRamdomLetter}
        disabled={foundWords.size === boardInfo.words.length}
        style={{
          border: "2px solid black",
          backgroundColor: "#ff9f9f",
          padding: "10px 15px",
          marginTop: 10,
          fontSize: "1.2em",
          alignSelf: "center",
        }}
      >
        💡 Need a hint?
      </button>
    </div>
  );
};

export default Board;
