import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import Board from "./Board";

import boardInfo from "./board.json";
import WordList from "./WordList";

const pick = (key) => (obj) => obj[key];

const partition = (predicate, xs) =>
  xs.reduce(
    ([ok, ko], x) => (predicate(x) ? [[...ok, x], ko] : [ok, [...ko, x]]),
    [[], []]
  );

const [horizontalWords, verticalWords] = partition(
  pick("horizontal"),
  boardInfo.words
);

horizontalWords.sort(({number: a}, {number: z}) => +a - +z);
verticalWords.sort(({number: a}, {number: z}) => +a - +z);

const HorizontalSpacer = ({ width }) => <div style={{ width }} />;

const isMobile = window.matchMedia?.("(max-width: 1125px)")?.matches;

const App = ({ onCompleted }) => {
  const [foundWords, setFoundWords] = useState(() => new Set());
  const [highlightedWord, setHighlightedWord] = useState("");

  const onWordsFound = (words) => {
    const newFoundWords = new Set([...foundWords, ...words]);
    setFoundWords(() => newFoundWords);

    if (newFoundWords.size !== boardInfo.words.length) {
      let i = 0;
      let newHighlightedWord = "";
      const currentlyHighlightedWordindex = boardInfo.words.findIndex(
        ({ word }) => word === highlightedWord
      );

      do {
        newHighlightedWord =
          boardInfo.words[
            (currentlyHighlightedWordindex + i++) % boardInfo.words.length
          ]?.word;
      } while (newFoundWords.has(newHighlightedWord));

      setHighlightedWord(newHighlightedWord);
    }
  };

  useEffect(() => {
    if (foundWords.size === boardInfo.words.length) {
      onCompleted();
    }
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column-reverse" : "row",
      }}
    >
      <WordList
        isMobile={isMobile}
        horizontalWords={horizontalWords}
        verticalWords={verticalWords}
        onSelectedWord={setHighlightedWord}
        highlightedWord={highlightedWord}
        foundWords={foundWords}
      />
      <HorizontalSpacer width={30} />
      <div
        style={{
          display: "grid",
          placeItems: "center",
        }}
      >
        <Board
          isMobile={isMobile}
          boardInfo={boardInfo}
          highlightedWord={highlightedWord}
          foundWords={foundWords}
          onWordsFound={onWordsFound}
          onFocus={setHighlightedWord}
          currentWordDefinition={
            (boardInfo.words.find(({ word }) => word === highlightedWord) || {})
              .def
          }
        />
      </div>
    </div>
  );
};

export default App;
