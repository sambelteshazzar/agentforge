/**
 * Preview utilities for react-live code sanitization and rendering
 */

export { prepareCodeForLive } from "./prepareCodeForLive";

// Scope types for live preview
export interface LivePreviewScope {
  React: typeof import("react");
  useState: typeof import("react").useState;
  useEffect: typeof import("react").useEffect;
  useRef: typeof import("react").useRef;
  [key: string]: unknown;
}

// Language detection utilities
export const isBackendLanguage = (lang: string): boolean => {
  const backendLangs = [
    "python", "py", "java", "c", "cpp", "c++", "csharp", "cs",
    "go", "golang", "rust", "ruby", "rb", "php", "swift", "kotlin",
    "scala", "elixir", "haskell", "perl", "r", "rlang"
  ];
  return backendLangs.includes(lang.toLowerCase());
};

export const isWebPreviewable = (lang: string): boolean => {
  const webLangs = [
    "jsx", "tsx", "js", "javascript", "ts", "typescript",
    "react", "html"
  ];
  return webLangs.includes(lang.toLowerCase());
};

export interface LanguageInfo {
  name: string;
  runCommand: string;
  icon: string;
  extension: string;
}

export const getLanguageInfo = (lang: string): LanguageInfo => {
  const langMap: Record<string, LanguageInfo> = {
    python: { name: "Python", runCommand: "python filename.py", icon: "🐍", extension: "py" },
    py: { name: "Python", runCommand: "python filename.py", icon: "🐍", extension: "py" },
    java: { name: "Java", runCommand: "javac filename.java && java ClassName", icon: "☕", extension: "java" },
    c: { name: "C", runCommand: "gcc filename.c -o output && ./output", icon: "⚙️", extension: "c" },
    cpp: { name: "C++", runCommand: "g++ filename.cpp -o output && ./output", icon: "⚙️", extension: "cpp" },
    "c++": { name: "C++", runCommand: "g++ filename.cpp -o output && ./output", icon: "⚙️", extension: "cpp" },
    go: { name: "Go", runCommand: "go run filename.go", icon: "🔵", extension: "go" },
    golang: { name: "Go", runCommand: "go run filename.go", icon: "🔵", extension: "go" },
    rust: { name: "Rust", runCommand: "cargo run", icon: "🦀", extension: "rs" },
    ruby: { name: "Ruby", runCommand: "ruby filename.rb", icon: "💎", extension: "rb" },
    rb: { name: "Ruby", runCommand: "ruby filename.rb", icon: "💎", extension: "rb" },
    php: { name: "PHP", runCommand: "php filename.php", icon: "🐘", extension: "php" },
    swift: { name: "Swift", runCommand: "swift filename.swift", icon: "🍎", extension: "swift" },
    kotlin: { name: "Kotlin", runCommand: "kotlinc filename.kt -include-runtime -d out.jar && java -jar out.jar", icon: "🟣", extension: "kt" },
    javascript: { name: "JavaScript", runCommand: "node filename.js", icon: "🟨", extension: "js" },
    js: { name: "JavaScript", runCommand: "node filename.js", icon: "🟨", extension: "js" },
    typescript: { name: "TypeScript", runCommand: "ts-node filename.ts", icon: "🔷", extension: "ts" },
    ts: { name: "TypeScript", runCommand: "ts-node filename.ts", icon: "🔷", extension: "ts" },
  };
  
  return langMap[lang.toLowerCase()] || {
    name: lang.toUpperCase(),
    runCommand: `Run the ${lang} file locally`,
    icon: "📄",
    extension: lang.toLowerCase(),
  };
};
