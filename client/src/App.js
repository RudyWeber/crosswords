import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import Board from "./Board";

import WordList from "./WordList";

import * as styles from "./App.module.scss";

const HorizontalSpacer = ({ width }) => <div style={{ width }} />;

const App = ({
  onCompleted,
  boardInfo,
  horizontalWords,
  verticalWords,
  allPositions,
}) => {
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
    <div class={styles.container}>
      <WordList
        horizontalWords={horizontalWords}
        verticalWords={verticalWords}
        onSelectedWord={setHighlightedWord}
        highlightedWord={highlightedWord}
        foundWords={foundWords}
      />
      <HorizontalSpacer width={30} />
      <div class={styles.boardContainer}>
        <Board
          boardInfo={boardInfo}
          highlightedWord={highlightedWord}
          foundWords={foundWords}
          onWordsFound={onWordsFound}
          onFocus={setHighlightedWord}
          allPositions={allPositions}
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
