import { useState, useCallback } from "react";

/* ---------------- TYPES ---------------- */

export type SpellingResult = "pending" | "correct" | "incorrect";

interface UseWordBuilderReturn {
  letters: string[];
  currentWord: string;
  result: SpellingResult;
  suggestedWord: string | null;
  wordVideo: string | null;
  letterVideos: string[];
  addLetter: (letter: string) => void;
  removeLetter: () => void;
  clearWord: () => void;
  checkSpelling: () => void;
  acceptCorrection: () => void;
  resetResult: () => void;
}

/* ---------------- DICTIONARY ---------------- */

const DICTIONARY = [
  "CAT", "DOG", "BIRD", "FISH", "BEAR", "LION", "TREE", "BOOK", "BALL", "STAR",
  "SUN", "MOON", "RAIN", "SNOW", "HAND", "FOOT", "HEAD", "EYE", "EAR", "NOSE",
  "APPLE", "BANANA", "ORANGE", "GRAPE", "WATER", "MILK", "BREAD", "CAKE",
  "HELLO", "GOODBYE", "PLEASE", "THANKS", "SORRY", "HAPPY", "SAD", "LOVE",
  "MOM", "DAD", "BABY", "FRIEND", "SCHOOL", "HOME", "PLAY", "EAT", "DRINK", "SLEEP"
];

/* ---------------- PATHS ---------------- */

const WORD_VIDEO_PATH = "/isl_videos/words/";
const LETTER_VIDEO_PATH = "/isl_videos/letters/";

/* ---------------- LEVENSHTEIN ---------------- */

const levenshteinDistance = (a: string, b: string): number => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 +
            Math.min(
              dp[i - 1][j],     // deletion
              dp[i][j - 1],     // insertion
              dp[i - 1][j - 1]  // substitution
            );
    }
  }

  return dp[a.length][b.length];
};

const findClosestWord = (word: string): string => {
  let minDist = Infinity;
  let closest = DICTIONARY[0];

  for (const dictWord of DICTIONARY) {
    const dist = levenshteinDistance(word, dictWord);
    if (dist < minDist) {
      minDist = dist;
      closest = dictWord;
    }
  }

  return closest;
};

/* ---------------- HOOK ---------------- */

export const useWordBuilder = (): UseWordBuilderReturn => {
  const [letters, setLetters] = useState<string[]>([]);
  const [result, setResult] = useState<SpellingResult>("pending");
  const [suggestedWord, setSuggestedWord] = useState<string | null>(null);
  const [wordVideo, setWordVideo] = useState<string | null>(null);
  const [letterVideos, setLetterVideos] = useState<string[]>([]);

  const currentWord = letters.join("").toUpperCase();

  const addLetter = useCallback((letter: string) => {
    setLetters(prev => [...prev, letter.toUpperCase()]);
    setResult("pending");
    setSuggestedWord(null);
    setWordVideo(null);
    setLetterVideos([]);
  }, []);

  const removeLetter = useCallback(() => {
    setLetters(prev => prev.slice(0, -1));
    setResult("pending");
    setSuggestedWord(null);
    setWordVideo(null);
    setLetterVideos([]);
  }, []);

  const clearWord = useCallback(() => {
    setLetters([]);
    setResult("pending");
    setSuggestedWord(null);
    setWordVideo(null);
    setLetterVideos([]);
  }, []);

  const checkSpelling = useCallback(() => {
    if (!currentWord) return;

    // ✅ Case 1: Correct word
    if (DICTIONARY.includes(currentWord)) {
      setResult("correct");
      setWordVideo(`${WORD_VIDEO_PATH}${currentWord}.mp4`);
      return;
    }

    // ❌ Case 2: Incorrect → find closest
    const closest = findClosestWord(currentWord);
    setResult("incorrect");
    setSuggestedWord(closest);
  }, [currentWord]);

  // User accepts suggested word → show LETTER signs
  const acceptCorrection = useCallback(() => {
    if (!suggestedWord) return;

    const videos = suggestedWord.split("").map(
      letter => `${LETTER_VIDEO_PATH}${letter}.mp4`
    );
    setLetterVideos(videos);
  }, [suggestedWord]);

  const resetResult = useCallback(() => {
    setResult("pending");
    setSuggestedWord(null);
    setWordVideo(null);
    setLetterVideos([]);
  }, []);

  return {
    letters,
    currentWord,
    result,
    suggestedWord,
    wordVideo,
    letterVideos,
    addLetter,
    removeLetter,
    clearWord,
    checkSpelling,
    acceptCorrection,
    resetResult
  };
};
