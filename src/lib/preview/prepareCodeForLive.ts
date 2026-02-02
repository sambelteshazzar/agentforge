/**
 * react-live does not execute code in a module context and does not support
 * TypeScript syntax by default. This helper strips common module/TS constructs
 * and attempts to extract JSX that can be rendered safely.
 */

const escapeForTemplateLiteral = (value: string) =>
  value.replace(/`/g, "\\`").replace(/\$/g, "\\$");

const stripParamTypes = (params: string) => {
  // Remove `: Type` inside parameter lists.
  // We intentionally keep this conservative to avoid corrupting JS expressions.
  return params.replace(/:\s*[^,)=]+(?=\s*(?:,|\)|=))/g, "");
};

const stripTsSyntax = (input: string) => {
  let code = input;

  // Remove React/JSX return type annotations and common TS annotations.
  code = code.replace(/:\s*React\.FC(<[^>]*>)?/g, "");
  code = code.replace(/:\s*React\.ReactNode/g, "");
  code = code.replace(/:\s*JSX\.Element/g, "");

  // Remove variable type annotations: const x: Foo = ...
  code = code.replace(
    /(\b(?:const|let|var)\s+[\w$]+)\s*:\s*[^=;\n]+(?=\s*(?:=|;))/g,
    "$1"
  );

  // Remove function param type annotations ONLY in parameter lists
  // - function foo(a: string, b: number) {}
  // - (a: string, b: number) => {}
  code = code.replace(/\bfunction\s+([\w$]+)\s*\(([^)]*)\)/g, (_m, name, params) => {
    return `function ${name}(${stripParamTypes(params)})`;
  });

  code = code.replace(/\(([^)]*)\)\s*=>/g, (_m, params) => {
    return `(${stripParamTypes(params)}) =>`;
  });

  // Single-parameter arrow functions: x: Foo =>
  code = code.replace(/(^|[=(,]\s*)([A-Za-z_$][\w$]*)\s*:\s*[^=,)]+(?=\s*=>)/g, "$1$2");

  // Remove return type annotations: ): Type => or ): Type {
  code = code.replace(/\)\s*:\s*[\w<>[\]|&\s,]+(?=\s*[{=])/g, ")");

  // Remove `as Something` assertions and `satisfies Something`
  code = code.replace(/\s+as\s+[\w<>[\]{}|&\s,.:]+/g, "");
  code = code.replace(/\s+satisfies\s+[\w<>[\]{}|&\s,.:]+/g, "");

  // Remove generic params on function declarations: function foo<T>(...) -> function foo(...)
  code = code.replace(/\bfunction\s+([\w$]+)\s*<[^>]+>\s*\(/g, "function $1(");

  return code;
};

const stripModuleSyntax = (input: string) => {
  let code = input;

  // Remove import statements
  code = code.replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "");
  code = code.replace(/^\s*import\s+['"][^'"]+['"];?\s*$/gm, "");

  // Remove export statements
  // Remove `export default Identifier;` entirely (otherwise we leave `Identifier;` behind)
  code = code.replace(/^\s*export\s+default\s+[A-Za-z_$][\w$]*\s*;?\s*$/gm, "");
  code = code.replace(/^\s*export\s*\*\s*from\s+['"][^'"]+['"];?\s*$/gm, "");
  code = code.replace(/^\s*export\s*\{[\s\S]*?\}\s*from\s+['"][^'"]+['"];?\s*$/gm, "");
  code = code.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, "");
  code = code.replace(/^\s*export\s+default\s+/gm, "");
  code = code.replace(/^\s*export\s+(?=const|function|class|let|var)/gm, "");

  return code;
};

const stripTypes = (input: string) => {
  let code = input;

  // Remove interface/type declarations
  code = code.replace(/^\s*interface\s+\w+\s*\{[\s\S]*?\}\s*$/gm, "");
  code = code.replace(/^\s*type\s+\w+\s*=[\s\S]*?;\s*$/gm, "");

  return code;
};

const extractJsxIfPossible = (cleanCode: string): string | null => {
  const code = cleanCode.trim();
  if (!code) return null;

  // If already JSX, return directly
  if (code.startsWith("<")) return code;

  // Function component pattern: const Name = (...) => { ... return (...) }
  const functionComponentMatch =
    code.match(
      /^(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)|[^=]*)?\s*=>\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}\s*;?\s*$/
    ) ||
    code.match(
      /^function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}\s*$/
    );

  if (functionComponentMatch?.[2]) {
    const jsx = functionComponentMatch[2].trim();
    if (jsx.startsWith("<")) return jsx;
  }

  // return (...) at the end
  const returnMatch = code.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*\}?\s*;?\s*$/);
  if (returnMatch?.[1]) {
    const jsx = returnMatch[1].trim();
    if (jsx.startsWith("<")) return jsx;
  }

  // Arrow fn returning JSX directly: () => <Comp />
  const arrowJsxMatch = code.match(/=>\s*(<[^;]+>)\s*;?\s*$/);
  if (arrowJsxMatch?.[1]) return arrowJsxMatch[1].trim();

  // If wrapped in parentheses
  const parenMatch = code.match(/^\(\s*([\s\S]*?)\s*\)$/);
  if (parenMatch?.[1]?.trim().startsWith("<")) return parenMatch[1].trim();

  // Any JSX element inside
  const jsxMatch = code.match(
    /(<[A-Z][a-zA-Z]*[\s\S]*?>[\s\S]*?<\/[A-Z][a-zA-Z]*>|<[a-z][a-zA-Z]*[\s\S]*?\/>|<[a-z][a-zA-Z]*[\s\S]*?>[\s\S]*?<\/[a-z][a-zA-Z]*>)/
  );
  if (jsxMatch?.[1]) return jsxMatch[1];

  return null;
};

export const prepareCodeForLive = (rawCode: string): string => {
  let cleanCode = (rawCode || "").replace(/\r\n/g, "\n").trim();

  cleanCode = stripModuleSyntax(cleanCode);
  cleanCode = stripTypes(cleanCode);
  cleanCode = stripTsSyntax(cleanCode);
  cleanCode = cleanCode.trim();

  const jsx = extractJsxIfPossible(cleanCode);
  if (jsx) return jsx;

  // For plain JS without JSX, render it as output text
  if (!cleanCode.includes("<") && !cleanCode.includes("return")) {
    const asLiteral = JSON.stringify(cleanCode);
    return `<div className="p-4 font-mono text-sm bg-muted rounded-lg">
      <div className="text-muted-foreground text-xs mb-2">JavaScript Output:</div>
      <pre className="text-foreground whitespace-pre-wrap">{${asLiteral}}</pre>
    </div>`;
  }

  // Fallback: show code as text to avoid crashing react-live with syntax errors
  const asLiteral = JSON.stringify(cleanCode);
  return `<div className="p-4 font-mono text-sm text-foreground"><pre>{${asLiteral}}</pre></div>`;
};
