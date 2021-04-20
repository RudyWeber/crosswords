# Crosswords generator

Disclaimer: I didn't think this code would actually end up being public so... sorry :).

## API

The API provides a single `/crosswords/generate` endpoint.<br />
Send a `POST` request with a body like:
```json
{
  "dict": {
    "wordA": "definition",
    "wordB": "definition"
  }
}
```

You'll get a JSON representing the board to be used in the client app.<br />
It'll try 3 times to create a board from the dictionnay you sent. If it didn't successfully place every word in the board, a `incomplete: true` property is added to the JSON response.

## Client

You get a `crosswords` function that takes an object with the properties:
- `rootId`: CSS id of the element to render the app in.
- `boardInfo`: the JSON you got from the API.
- `onCompleted`: a callback to be called when the board is fully completed.
