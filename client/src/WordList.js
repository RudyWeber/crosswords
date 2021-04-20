import { h } from "preact";

const WordList = ({
  horizontalWords,
  verticalWords,
  onSelectedWord,
  foundWords,
  highlightedWord,
  isMobile,
}) => {
  return (
    <div
      style={{
        textAlign: isMobile ? "center" : "",
      }}
    >
      <h1>➡ Across</h1>
      <ol style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {horizontalWords.map(({ word, def, number }, index) => (
          <li
            key={def}
            onClick={(e) => {
              e.preventDefault();
              foundWords.has(word) || onSelectedWord(word);
            }}
            style={{
              borderBottom:
                index === horizontalWords.length - 1
                  ? "none"
                  : "thin solid grey",
              padding: 10,
              backgroundColor: foundWords.has(word)
                ? "lightgreen"
                : word === highlightedWord
                ? "lightblue"
                : "transparent",
              cursor: foundWords.has(word) ? "default" : "pointer",
              textAlign: "left"
            }}
          >
            {number}.&nbsp;&nbsp;{def}
          </li>
        ))}
      </ol>
      <h1>⬇ Down</h1>
      <ol style={{ padding: 0, listStyle: "none" }}>
        {verticalWords.map(({ word, def, number }, index) => (
          <li
            key={def}
            onClick={(e) => {
              e.preventDefault();
              onSelectedWord(word);
              foundWords.has(word) || onSelectedWord(word);
            }}
            style={{
              borderBottom:
                index === verticalWords.length - 1 ? "none" : "thin solid grey",
              padding: 10,
              backgroundColor: foundWords.has(word)
                ? "lightgreen"
                : word === highlightedWord
                ? "lightblue"
                : "transparent",
              cursor: foundWords.has(word) ? "default" : "pointer",
              textAlign: "left"
            }}
          >
            {number}.&nbsp;&nbsp;{def}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default WordList;
