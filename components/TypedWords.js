"use client";

import { useEffect, useState } from "react";

const WORDS = ["классике", "фейде", "бритье", "детской стрижке"];

export default function TypedWords() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[index];
    const delay = deleting ? 45 : text === word ? 1400 : 90;
    const timer = setTimeout(() => {
      if (!deleting && text === word) {
        setDeleting(true);
        return;
      }
      if (deleting && text === "") {
        setDeleting(false);
        setIndex((value) => (value + 1) % WORDS.length);
        return;
      }
      setText(word.slice(0, text.length + (deleting ? -1 : 1)));
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, index]);

  return (
    <p className="typed">
      Запись на <span>{text}</span>
      <i />
    </p>
  );
}
