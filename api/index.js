import express from "express";
import generate from "./generate.js";

const { PORT = 9000 } = process.env;

const app = express();

app.use(express.json());

app.post(
  "/crosswords/generate",
  (req, res, next) => {
    const { dict } = req.body;

    if (
      !dict ||
      Object.entries(dict).some(
        ([key, value]) => typeof key !== "string" || typeof value !== "string"
      )
    ) {
      return res
        .status(400)
        .send(`Body must be { dict: Record<string, string> }`);
    }

    next();
  },
  (req, res) => {
    const { dict } = req.body;

    return res.send(generate(dict));
  }
);

app.listen(PORT, () => {
  console.log(`Listening on :${PORT}...`);
});
