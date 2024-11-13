import { useState, useMemo, useRef, useEffect, ChangeEvent } from "react";

type CharacterCounterProps = {
  current: number;
  max: number;
};

// スタイル定義
const styles = {
  container: {
    position: "relative" as const,
  },
  textAreaContainer: {
    position: "relative" as const,
    marginBottom: "24px",
  },
  common: {
    width: "100%",
    minHeight: "100px",
    padding: "8px",
    margin: 0,
    border: "1px solid #ccc",
    fontFamily: "sans-serif",
    fontSize: "16px",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap" as const,
    wordWrap: "break-word" as const,
    boxSizing: "border-box" as const,
    overflow: "auto" as const,
    scrollbarWidth: "none" as const,
    msOverflowStyle: "none" as const,
  },
  highlightLayer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    pointerEvents: "none" as const,
    backgroundColor: "transparent",
  },
  textarea: {
    position: "relative" as const,
    background: "transparent",
    color: "transparent",
    caretColor: "black",
    resize: "none" as const,
  },
  counter: {
    position: "absolute" as const,
    bottom: "-24px",
    right: 0,
    fontSize: "14px",
  },
  searchInput: {
    marginTop: "8px",
  },
} as const;

// 正規表現の特殊文字をエスケープする関数
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// 文字数カウンターコンポーネント
const CharacterCounter = ({ current, max }: CharacterCounterProps) => (
  <div
    style={{
      ...styles.counter,
      color: current >= max ? "#ff4444" : "#666666",
    }}
  >
    {current}/{max}
  </div>
);

// ハイライトレイヤーコンポーネント
const HighlightLayer = ({
  divRef,
  highlightedContent,
}: {
  divRef: React.RefObject<HTMLDivElement>;
  highlightedContent: React.ReactNode;
}) => (
  <div
    ref={divRef}
    style={{
      ...styles.common,
      ...styles.highlightLayer,
    }}
  >
    {highlightedContent}
  </div>
);

// メインコンポーネント
export const HighlightedTextarea: React.FC = () => {
  const [text, setText] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const MAX_CHARS = 4000;

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  };

  // ハイライト処理
  const highlightedContent = useMemo(() => {
    if (!highlightText) return text;

    try {
      const escapedHighlightText = escapeRegExp(highlightText);
      const parts = text.split(new RegExp(`(${escapedHighlightText})`, "gi"));
      return parts.map((part, index) => {
        if (part.toLowerCase() === highlightText.toLowerCase()) {
          return (
            <span key={index} style={{ backgroundColor: "yellow" }}>
              {part}
            </span>
          );
        }
        return part;
      });
    } catch (error) {
      console.error(error);
      // 正規表現エラーが発生した場合は元のテキストを返す
      return text;
    }
  }, [text, highlightText]);

  // スクロール同期
  useEffect(() => {
    const textarea = textareaRef.current;
    const div = divRef.current;

    if (textarea && div) {
      const syncScroll = () => {
        div.scrollTop = textarea.scrollTop;
      };

      textarea.addEventListener("scroll", syncScroll);
      textarea.addEventListener("input", syncScroll);

      return () => {
        textarea.removeEventListener("scroll", syncScroll);
        textarea.removeEventListener("input", syncScroll);
      };
    }
  }, []);

  // 高さ自動調整
  useEffect(() => {
    const textarea = textareaRef.current;
    const div = divRef.current;

    if (textarea && div) {
      const currentScrollTop = textarea.scrollTop;

      textarea.style.height = "auto";
      div.style.height = "auto";

      const newHeight = Math.max(textarea.scrollHeight, 100);

      textarea.style.height = `${newHeight}px`;
      div.style.height = `${newHeight}px`;

      textarea.scrollTop = currentScrollTop;
      div.scrollTop = currentScrollTop;
    }
  }, [text]);

  return (
    <div style={styles.container}>
      <div style={styles.textAreaContainer}>
        <HighlightLayer
          divRef={divRef}
          highlightedContent={highlightedContent}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          maxLength={MAX_CHARS}
          style={{
            ...styles.common,
            ...styles.textarea,
          }}
        />

        <style>
          {`
            textarea::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        <CharacterCounter current={text.length} max={MAX_CHARS} />
      </div>

      <input
        type="text"
        value={highlightText}
        onChange={(e) => setHighlightText(e.target.value)}
        placeholder="ハイライトする文字列を入力"
        style={styles.searchInput}
      />
    </div>
  );
};
