import { h, render } from "preact";
import App from "./App";

const pick = (key) => (obj) => obj[key];

const partition = (predicate, xs) =>
  xs.reduce(
    ([ok, ko], x) => (predicate(x) ? [[...ok, x], ko] : [ok, [...ko, x]]),
    [[], []]
  );

window.crosswords = function ({
  rootId,
  onCompleted = () => {},
  boardInfo = {},
}) {
  // Stuff that will help and needs to be computed only once.
  // Better to do this here and send as props than relying on `useMemo`.
  // It's a super small app so let's keep it simple and not care about "props drilling".

  const [horizontalWords, verticalWords] = partition(
    pick("horizontal"),
    boardInfo.words
  );

  horizontalWords.sort(({ number: a }, { number: z }) => +a - +z);
  verticalWords.sort(({ number: a }, { number: z }) => +a - +z);

  const allPositions = new Set(
    boardInfo.words
      .flatMap(({ positions }) => positions)
      .map(([x, y]) => `${x}-${y}`)
  );

  render(
    <App
      onCompleted={onCompleted}
      boardInfo={boardInfo}
      horizontalWords={horizontalWords}
      verticalWords={verticalWords}
      allPositions={allPositions}
    />,
    document.getElementById(rootId)
  );
};
